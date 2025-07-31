#!/usr/bin/env node

/**
 * Component creation script for HAKIT editor projects
 * This script helps users add new components to their existing project
 */

import chalk from 'chalk';
import prompts from 'prompts';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility functions
const toPascalCase = (str: string): string => {
  return str.replace(/(?:^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());
};

interface ManifestComponent {
  name: string;
  src: string;
}

interface Manifest {
  components: ManifestComponent[];
}

async function createComponent() {
  console.log(chalk.blue('🧩 Create a new HAKIT component'));
  console.log();

  // Check if we're in a valid HAKIT project
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  if (!(await fs.pathExists(manifestPath))) {
    console.error(chalk.red("✖ Error: manifest.json not found. Make sure you're in a HAKIT project directory."));
    process.exit(1);
  }

  const answers = await prompts([
    {
      type: 'text',
      name: 'componentName',
      message: 'Component name:',
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

  if (!answers.componentName) {
    console.log(chalk.red('✖ Component creation cancelled'));
    process.exit(1);
  }

  const componentName = answers.componentName;
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.green(`✓ Creating component "${componentName}"`));

  try {
    // Check if component already exists
    const componentDir = path.join(projectPath, 'src', 'components', componentName);
    if (await fs.pathExists(componentDir)) {
      console.error(chalk.red(`✖ Error: Component "${componentName}" already exists`));
      process.exit(1);
    }

    // Read current manifest
    const manifest: Manifest = await fs.readJson(manifestPath);

    // Check if component is already in manifest
    const existingComponent = manifest.components.find((comp: ManifestComponent) => comp.name === componentName);
    if (existingComponent) {
      console.error(chalk.red(`✖ Error: Component "${componentName}" already exists in manifest.json`));
      process.exit(1);
    }

    // Create component directory and file
    console.log(chalk.blue('📁 Creating component files...'));
    await fs.ensureDir(componentDir);

    // Copy component template and replace placeholders
    const componentTemplatePath = path.join(__dirname, '../../templates/basic/src/components/__COMPONENT_NAME__/index.tsx');
    let componentContent = await fs.readFile(componentTemplatePath, 'utf8');
    componentContent = componentContent
      .replace(/DefaultComponentName/g, componentName)
      .replace(/defaultcomponentname/g, componentName.toLowerCase());

    await fs.writeFile(path.join(componentDir, 'index.tsx'), componentContent);

    // Update manifest.json
    console.log(chalk.blue('📝 Updating manifest.json...'));
    const newComponent: ManifestComponent = {
      name: componentName,
      src: `./src/components/${componentName}/index.tsx`,
    };

    manifest.components.push(newComponent);
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });

    console.log();
    console.log(chalk.green('✓ Component created successfully!'));
    console.log();
    console.log('Files created:');
    console.log(chalk.cyan(`  src/components/${componentName}/index.tsx`));
    console.log();
    console.log('Updated:');
    console.log(chalk.cyan('  manifest.json'));
    console.log();
    console.log('Next steps:');
    console.log(chalk.cyan('  1. Customize your component in the created file'));
    console.log(chalk.cyan('  2. Run "npm run build" to build your components'));
    console.log();
    console.log('Happy coding! 🎉');
  } catch (error) {
    console.error(chalk.red('✖ Failed to create component:'), error);
    process.exit(1);
  }
}

createComponent();
