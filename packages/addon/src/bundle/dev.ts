#!/usr/bin/env node

/**
 * Development server script for HAKIT editor projects
 * This script handles Module Federation development with RSBuild
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createRsbuild } from '@rsbuild/core';
import type { PackageJson } from 'type-fest';
import type { Manifest, BuildOptions } from './types';
import { createMFConfig } from './module-federation.config';
import { createRsbuildConfig } from './rsbuild.config';
import { log, setDebugMode, validateManifest } from './shared';
import path from 'path';
import fs from 'fs-extra';

interface DevOptions extends BuildOptions {
  port?: number;
  host?: string;
}

/**
 * Main development function that starts the dev server
 */
export async function startDevServer(options: DevOptions): Promise<void> {
  const { debug, projectPath, port = 3000, host = 'localhost' } = options;
  setDebugMode(debug);

  console.log(chalk.blue('🚀 Starting HAKIT editor development server...'));

  // Read manifest.json
  const manifestPath = path.join(projectPath, 'manifest.json');
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error('manifest.json not found. Make sure you have a manifest.json file in your project root.');
  }

  const manifest: Manifest = validateManifest(await fs.readJson(manifestPath));
  const packageJson: PackageJson = await fs.readJson(path.join(projectPath, 'package.json'));

  console.log(chalk.green(`📦 Found ${manifest.components.length} component(s) to serve`));

  // Validate components exist
  for (const component of manifest.components) {
    const componentPath = path.resolve(projectPath, component.src);
    if (!(await fs.pathExists(componentPath))) {
      throw new Error(`Component file not found: ${component.src}`);
    }
  }

  log('🔧 Setting up development server...');

  try {
    const federationConfig = createMFConfig(manifest, packageJson);
    let rsbuildConfig = createRsbuildConfig(federationConfig, projectPath);

    // Ensure we have the config object, not a function
    if (typeof rsbuildConfig.rsbuildConfig === 'function') {
      rsbuildConfig = {
        ...rsbuildConfig,
        rsbuildConfig: await rsbuildConfig.rsbuildConfig(),
      };
    }

    // Override config for development
    rsbuildConfig.rsbuildConfig = {
      ...rsbuildConfig.rsbuildConfig,
      dev: {
        hmr: true,
        liveReload: true,
      },
      server: {
        port,
        host,
      },
      output: {
        // Remove asset prefix for development
        assetPrefix: '/',
        distPath: {
          root: './dist/dev',
        },
      },
    };

    // Create RSBuild instance with development configuration
    const rsbuild = await createRsbuild(rsbuildConfig);

    // Start the development server
    const devServer = await rsbuild.startDevServer();

    console.log(chalk.green('✅ Development server started successfully!'));
    console.log('\n');
    console.log(chalk.yellow('Press Ctrl+C to stop the server'));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Shutting down development server...'));
      if (devServer && devServer.server) {
        await devServer.server.close();
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log(chalk.yellow('\n🛑 Shutting down development server...'));
      if (devServer && devServer.server) {
        await devServer.server.close();
      }
      process.exit(0);
    });
  } catch (devError) {
    console.error(chalk.red('❌ Development server failed to start:'), devError);
    throw devError;
  }
}

/**
 * CLI entry point - always run when this file is executed
 */
const program = new Command();

program
  .name('@hakit/addon dev')
  .description('Start HAKIT editor development server with Module Federation')
  .option('--debug', 'Enable debug logging', false)
  .option('-p, --port <port>', 'Port number for the development server', '3000')
  .option('--host <host>', 'Host for the development server', 'localhost')
  .action(async options => {
    try {
      await startDevServer({
        debug: options.debug,
        projectPath: process.cwd(),
        port: parseInt(options.port, 10),
        host: options.host,
      });
    } catch (error) {
      console.error(chalk.red('❌ Development server failed:'), error);
      process.exit(1);
    }
  });

program.parse();
