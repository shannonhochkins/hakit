# @hakit/create-editor

![HAKIT Logo](https://img.shields.io/badge/HAKIT-Editor-blue)
![npm version](https://img.shields.io/npm/v/@hakit/create-editor)
![License](https://img.shields.io/badge/license-Proprietary-red)

Create [hakit.dev](https://hakit.dev) compatible addon repositories with a single command.

## Quick Start

Create a new HAKIT editor project using any of the following package managers:

### npm
```bash
npm create @hakit/editor@latest
```

### Yarn
```bash
# Yarn 1.x (Classic)
yarn create @hakit/editor@latest

# Yarn 2+ (Berry) 
yarn dlx @hakit/create-editor@latest
```

### pnpm
```bash
# Using create shorthand
pnpm create @hakit/editor@latest

# Using dlx
pnpm dlx @hakit/create-editor@latest
```

### Bun
```bash
bun create @hakit/editor@latest
```

The CLI will prompt you for:
- **Project name** (e.g., `@hakit/weather-components`)
- **Description** - A description of your component library
- **First component name** (e.g., `WeatherCard`) - The name of your first component
- **Install dependencies** - Whether to automatically install dependencies (default: yes)

## What You Get

After running the create command, you'll have a new project with:

- ⚛️ **React** - Latest React with TypeScript support
- 🏗️ **Module Federation** - Component sharing via Module Federation to communicate with [hakit.dev](https://hakit.dev)
- 🏠 **HAKIT Integration** - Ready-to-use @hakit/core - communication with home assistant
- 📝 **TypeScript** - Full TypeScript support out of the box
- 📦 **Development** - A development server which you can use via the [Module Federation DevTools](https://chromewebstore.google.com/detail/module-federation/aeoilchhomapofiopejjlecddfldpeom) to test directly within [hakit.dev](https://hakit.dev)
- 📦 **Packaging** - Automated version bundling with a single command
- 🎯 **Manifest-based** - Component registration via manifest.json

## Available Commands

A generated project includes these npm scripts:

- `npm run dev` - Start development server with Module Federation and hot reload
- `npm run build` - Build and package components into a distributable archive
- `npm run create-component` - Generate a new component using the built-in scaffolding tool

Each command uses the bundled tools from this package to provide a seamless development experience.

## Development & Contributing

### Testing the Package

To test changes to the create-editor package:

```bash
# Build and pack the package
npm run build && npm pack

# Run the test script (creates a project in ./tmp)
npm run test:script

# Navigate to test project and try commands
cd tmp
npm install
npm run build
npm run dev
npm run create-component
```

### Installing a Test Package

If you need to test with a specific packed version:

```bash
# Install the packed .tgz file
npm install ../hakit-create-editor-1.0.0.tgz
npm run build
```

### Adding New Dependencies

### Project Structure

```
@hakit/create-editor/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── src/
│   ├── index.ts              # Main entry point
│   ├── bin/
│   │   └── index.ts          # CLI entry point for project creation
│   ├── bundle/
│   │   ├── shared.ts         # Shared utilities and validation
│   │   ├── bundle.ts         # Production build command
│   │   ├── dev.ts            # Development server command
│   │   ├── module-federation.config.ts
│   │   ├── rsbuild.config.ts
│   │   └── types.ts
│   └── component/
│       └── index.ts          # Component scaffolding command
└── templates/
    ├── component.tsx         # Component template
    └── basic/                # Basic project template
        ├── package.json
        ├── tsconfig.json
        ├── manifest.json
        ├── README.md
        └── src/
            ├── index.tsx
            └── components/
                └── DefaultComponentName/
                    └── index.tsx
```

### Binary Commands

The package provides several CLI commands:

- `@hakit/create-editor` / `create-hakit-component` - Create new projects
- `hakit-bundle` - Build and package components
- `hakit-dev` - Start development server  
- `hakit-create-component` - Generate new components

### Build System

The package uses:
- **Tsup** for TypeScript compilation and bundling
- **RSBuild** with Module Federation for component builds
- **Commander.js** for CLI interfaces
- **Prompts** for interactive project creation

### Module Federation Integration

Components are exposed via Module Federation, allowing them to be dynamically loaded into HAKIT dashboards. The build system handles:

- Automatic manifest generation
- Component bundling and optimization
- Development server with hot module replacement
- Production packaging into distributable archives


## Support

- 📖 [HAKIT Documentation](https://hakit.dev)
- 🐛 [Report Issues](https://github.com/shannonhochkins/hakit/issues)

