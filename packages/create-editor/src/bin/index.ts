#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectAnswers {
  projectName: string;
  description: string;
  firstComponentName: string;
}

// Utility functions
const toPascalCase = (str: string): string => {
  return str.replace(/(?:^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());
};

const getLatestNpmVersion = (packageName: string): string => {
  try {
    const stdout = execSync(`npm show ${packageName} version`, { encoding: 'utf8' });
    return `^${stdout.trim()}`;
  } catch (error) {
    console.error(`Error fetching latest version of ${packageName}:`, error);
    throw new Error(`Failed to fetch latest version for ${packageName}`);
  }
};

const program = new Command();

program
  .name('@hakit/create-editor')
  .description('Create a new HAKIT editor application')
  .version('1.0.0')
  .action(async () => {
    console.log(chalk.blue('🚀 Welcome to HAKIT Editor!'));
    console.log();

    const answers = await prompts([
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: '@hakit/weather-components',
        validate: (value: string) => {
          if (!value) return 'Project name is required';
          return true;
        },
      },
      {
        type: 'text',
        name: 'description',
        message: 'Description:',
        initial: 'A collection of weather components for HAKIT',
        validate: (value: string) => {
          if (!value) return 'Description is required';
          return true;
        },
      },
      {
        type: 'text',
        name: 'firstComponentName',
        message: 'First component name:',
        initial: 'WeatherCard',
        validate: (value: string) => {
          if (!value) return 'Component name is required';
          const pascalCased = toPascalCase(value);
          if (value !== pascalCased) {
            return `Component name must be in PascalCase. Did you mean "${pascalCased}"?`;
          }
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
            return 'Component name must start with uppercase letter and contain only letters and numbers';
          }
          return true;
        },
      },
    ]);

    if (!answers.projectName || !answers.description || !answers.firstComponentName) {
      console.log(chalk.red('✖ Project creation cancelled'));
      process.exit(1);
    }

    const projectPath = process.cwd();

    console.log();
    console.log(chalk.green(`✓ Creating project in ${chalk.bold(projectPath)}`));

    try {
      // Create the project
      await createProject(projectPath, answers);

      console.log();
      console.log(chalk.green('✓ Project created successfully!'));
      console.log();
      console.log('Next steps:');
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev') + ' - ' + chalk.bold('start the development server for the chrome extension'));
      console.log(chalk.cyan('  npm run build') + ' - ' + chalk.bold('generate a versioned zip file for the extension'));
      console.log();
      console.log('Happy coding! 🎉');
    } catch (error) {
      console.error(chalk.red('✖ Failed to create project:'), error);
      process.exit(1);
    }
  });

async function createProject(projectPath: string, answers: ProjectAnswers) {
  // Check if directory is empty (current directory should be mostly empty for project creation)
  const files = await fs.readdir(projectPath);
  const hasRelevantFiles = files.some(
    file => !file.startsWith('.') && !['node_modules', 'package-lock.json', 'yarn.lock', 'bun.lockb', 'tmp'].includes(file)
  );

  if (hasRelevantFiles) {
    console.log(chalk.yellow('⚠ Directory contains files. Some files may be overwritten.'));
  }

  // Get template path
  const templatePath = path.join(__dirname, '../../templates/basic');

  console.log(chalk.blue('📂 Copying template files...'));

  // Copy all template files recursively
  await fs.copy(templatePath, projectPath, {
    filter: src => {
      // Skip copying placeholder component folder structure for now
      return !src.includes('__COMPONENT_NAME__');
    },
  });

  // Replace placeholders in copied files
  console.log(chalk.blue('🔧 Customizing template...'));

  // Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Replace placeholders
  packageJson.name = answers.projectName;
  packageJson.description = answers.description;

  // Get latest versions for dependencies
  console.log(chalk.blue('📦 Fetching latest package versions...'));

  const dependencies: string[] = [];

  const devDependencies = [
    '@hakit/create-editor',
    '@module-federation/rsbuild-plugin',
    '@rsbuild/core',
    '@rsbuild/plugin-react',
    '@types/archiver',
    '@swc/plugin-emotion',
    '@types/node',
    '@types/react',
    '@eslint/js',
    'eslint',
    'eslint-plugin-react-hooks',
    'eslint-plugin-react-refresh',
    'typescript',
  ];

  const peerDependencies = ['react', 'react-dom', 'home-assistant-js-websocket', '@emotion/react', '@hakit/core', 'archiver'];

  // Fetch latest versions
  packageJson.dependencies = {};
  packageJson.devDependencies = {};

  packageJson.peerDependencies = {};

  console.log(chalk.gray('  Fetching dependency versions...'));
  const dependencyPromises = dependencies.map(async dep => ({
    name: dep,
    version: getLatestNpmVersion(dep),
  }));

  console.log(chalk.gray('  Fetching dev dependency versions...'));
  const devDependencyPromises = devDependencies.map(async dep => ({
    name: dep,
    version: getLatestNpmVersion(dep),
  }));

  // Fetch peer dependencies
  const peerDependencyPromises = peerDependencies.map(async dep => ({
    name: dep,
    version: getLatestNpmVersion(dep),
  }));

  // Fetch all versions in parallel
  const [depResults, devDepResults, peerDepResults] = await Promise.all([
    Promise.all(dependencyPromises),
    Promise.all(devDependencyPromises),
    Promise.all(peerDependencyPromises),
  ]);

  // Populate dependencies
  for (const { name, version } of depResults) {
    packageJson.dependencies[name] = version;
  }

  // Populate dev dependencies
  for (const { name, version } of devDepResults) {
    packageJson.devDependencies[name] = version;
  }

  // Populate peer dependencies
  for (const { name, version } of peerDepResults) {
    packageJson.peerDependencies[name] = version;
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Replace placeholders in README.md
  const readmePath = path.join(projectPath, 'README.md');
  let readmeContent = await fs.readFile(readmePath, 'utf8');
  readmeContent = readmeContent
    .replace(/DefaultProjectName/g, answers.projectName)
    .replace(/DefaultProjectDescription/g, answers.description)
    .replace(/DefaultComponentName/g, answers.firstComponentName);
  await fs.writeFile(readmePath, readmeContent);

  // Replace placeholders in manifest.json
  const manifestPath = path.join(projectPath, 'manifest.json');
  const manifest = await fs.readJson(manifestPath);
  manifest.components[0].name = answers.firstComponentName;
  manifest.components[0].src = `./src/components/${answers.firstComponentName}/index.tsx`;
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });

  // Create component directory and file from template
  console.log(chalk.blue('📁 Creating component files...'));
  const componentDir = path.join(projectPath, 'src', 'components', answers.firstComponentName);
  await fs.ensureDir(componentDir);

  // Copy component template and replace placeholders
  const componentTemplatePath = path.join(templatePath, 'src', 'components', '__COMPONENT_NAME__', 'index.tsx');
  let componentContent = await fs.readFile(componentTemplatePath, 'utf8');
  componentContent = componentContent.replace(/DefaultComponentName/g, answers.firstComponentName);
  await fs.writeFile(path.join(componentDir, 'index.tsx'), componentContent);
}

program.parse();
