#!/usr/bin/env node

/**
 * Build script for HAKIT editor projects
 * This script handles Module Federation building with RSLib
 */

import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import readline from 'readline';
import { Command } from 'commander';
import chalk from 'chalk';
import { createRsbuild } from '@rsbuild/core';
import type { PackageJson } from 'type-fest';
import type { Manifest as ModuleFederationManifest } from '@module-federation/sdk';
import type { Manifest, BuildOptions } from './types';
import { createMFConfig } from './module-federation.config';
import { createRsbuildConfig } from './rsbuild.config';
import { log, setDebugMode, validateManifest } from './shared';

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

function shouldExcludeFile(filePath: string): boolean {
  const excludeExtensions = ['.txt', '.ts', '.map'];
  const excludePatterns = [/\.LICENSE\.txt$/, /\.d\.ts$/, /\.ts\.map$/, /\.js\.map$/, /\.css\.map$/];

  const ext = path.extname(filePath);
  if (excludeExtensions.includes(ext)) {
    return true;
  }

  return excludePatterns.some(pattern => pattern.test(filePath));
}

function getFilesToInclude(distMfDir: string): Set<string> {
  const manifestPath = path.join(distMfDir, 'mf-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('mf-manifest.json not found in dist/mf directory');
  }

  const manifest: ModuleFederationManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const filesToInclude = new Set<string>();

  // Always include the main entry files
  filesToInclude.add('mf-manifest.json');
  filesToInclude.add('mf-stats.json');

  // Add the main remote entry file
  if (manifest.metaData?.remoteEntry?.name) {
    filesToInclude.add(manifest.metaData.remoteEntry.name);
  }

  // Extract files from exposes
  if (manifest.exposes && Array.isArray(manifest.exposes)) {
    for (const expose of manifest.exposes) {
      if (expose.assets) {
        // Add JS assets
        if (expose.assets.js) {
          if (expose.assets.js.sync) {
            for (const file of expose.assets.js.sync) {
              filesToInclude.add(file);
            }
          }
          if (expose.assets.js.async) {
            for (const file of expose.assets.js.async) {
              filesToInclude.add(file);
            }
          }
        }

        // Add CSS assets
        if (expose.assets.css) {
          if (expose.assets.css.sync) {
            for (const file of expose.assets.css.sync) {
              filesToInclude.add(file);
            }
          }
          if (expose.assets.css.async) {
            for (const file of expose.assets.css.async) {
              filesToInclude.add(file);
            }
          }
        }
      }
    }
  }

  // Add any additional files from the dist/mf directory
  function addDirectoryFiles(dir: string, baseDir: string = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const relativePath = path.join(baseDir, file);

      if (stat.isDirectory()) {
        addDirectoryFiles(filePath, relativePath);
      } else {
        filesToInclude.add(relativePath);
      }
    }
  }

  addDirectoryFiles(distMfDir);

  log(`📋 Found ${filesToInclude.size} files to include:`);
  filesToInclude.forEach(file => log(`  - ${file}`));

  return filesToInclude;
}

async function createZipFile(projectPath: string, distMfDir: string, version: string): Promise<void> {
  const versionsDir = path.join(projectPath, 'versions');
  const zipFileName = `v${version}.zip`;
  const zipFilePath = path.join(versionsDir, zipFileName);

  log(`📦 Creating zip file: ${zipFileName}`);

  // Create readline interface for user input
  const rl = createReadlineInterface();

  try {
    // Check if versions directory exists, create if not
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
      log(`📁 Created versions directory`);
    }

    // Check if zip file already exists
    if (fs.existsSync(zipFilePath)) {
      log(`⚠️  Version ${version} already exists at: ${zipFilePath}`);
      const answer = await askQuestion(rl, `Would you like to replace it? (yes/no): `);

      if (answer !== 'yes' && answer !== 'y') {
        log('❌ Build cancelled.');
        rl.close();
        process.exit(1);
      }

      // Remove existing file
      fs.unlinkSync(zipFilePath);
      log(`🗑️  Removed existing file: ${zipFileName}`);
    }

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on('close', () => {
        log(`✅ Archive created successfully: ${archive.pointer()} total bytes`);
        resolve();
      });

      archive.on('error', err => {
        reject(err);
      });

      archive.pipe(output);

      // Get files to include
      const filesToInclude = getFilesToInclude(distMfDir);

      // Add files to the archive
      for (const fileName of filesToInclude) {
        const filePath = path.join(distMfDir, fileName);

        if (fs.existsSync(filePath)) {
          if (!shouldExcludeFile(filePath)) {
            archive.file(filePath, { name: fileName });
            log(`  📄 Added: ${fileName}`);
          } else {
            log(`  ❌ Excluded: ${fileName}`);
          }
        } else {
          log(`  ⚠️  File not found: ${fileName}`);
        }
      }

      // Add the root manifest.json file
      const rootManifestPath = path.join(projectPath, 'manifest.json');
      if (fs.existsSync(rootManifestPath)) {
        archive.file(rootManifestPath, { name: 'manifest.json' });
        log(`  📄 Added: manifest.json (from root)`);
      } else {
        log(`  ⚠️  Root manifest.json not found`);
      }

      archive.finalize();
    });
  } finally {
    rl.close();
  }
}

/**
 * Main build function that packages the HAKIT components
 */
export async function buildProject(options: BuildOptions): Promise<void> {
  const { debug, projectPath } = options;
  setDebugMode(debug);

  console.log(chalk.blue('🏗️ Building HAKIT editor project...'));

  // Read manifest.json
  const manifestPath = path.join(projectPath, 'manifest.json');
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error('manifest.json not found. Make sure you have a manifest.json file in your project root.');
  }

  const manifest: Manifest = validateManifest(await fs.readJson(manifestPath));
  const packageJson: PackageJson = await fs.readJson(path.join(projectPath, 'package.json'));
  const version = packageJson.version;

  if (!version) {
    throw new Error('Package version is required in package.json');
  }

  console.log(chalk.green(`📦 Found ${manifest.components.length} component(s) to build`));

  // Validate components exist
  for (const component of manifest.components) {
    const componentPath = path.resolve(projectPath, component.src);
    if (!(await fs.pathExists(componentPath))) {
      throw new Error(`Component file not found: ${component.src}`);
    }
  }

  const distMfDir = path.join(projectPath, 'dist', 'mf');

  // Clean existing dist directory
  if (fs.existsSync(distMfDir)) {
    log('🧹 Cleaning existing build...');
    fs.rmSync(distMfDir, { recursive: true, force: true });
  }

  log('🔨 Building module federation...');

  try {
    const federationConfig = createMFConfig(manifest, packageJson);
    const rsbuildConfig = createRsbuildConfig(federationConfig, projectPath);
    // Create RSBuild instance with configuration
    const rsbuild = await createRsbuild(rsbuildConfig);
    // Run the build
    await rsbuild.build();

    log('✅ Build completed successfully');
  } catch (buildError) {
    console.error(chalk.red('❌ Build failed:'), buildError);
    throw buildError;
  }

  // Check if build was successful
  if (!fs.existsSync(distMfDir)) {
    throw new Error('Module federation build failed - dist/mf directory not found');
  }

  // Create zip file
  await createZipFile(projectPath, distMfDir, version);

  console.log(chalk.green('🎉 Build completed successfully!'));
  console.log(chalk.cyan(`📦 Package: v${version}.zip`));
  console.log(chalk.cyan(`📍 Location: ${path.join(projectPath, 'versions', `v${version}.zip`)}`));
}

/**
 * CLI entry point when called directly
 */
/**
 * CLI entry point - always run when this file is executed
 */
const program = new Command();

program
  .name('@hakit/create-editor bundle')
  .description('Build HAKIT editor components with Module Federation')
  .option('--debug', 'Enable debug logging', false)
  .action(async options => {
    try {
      await buildProject({
        debug: options.debug,
        projectPath: process.cwd(),
      });
    } catch (error) {
      console.error(chalk.red('❌ Build failed:'), error);
      process.exit(1);
    }
  });

program.parse();
