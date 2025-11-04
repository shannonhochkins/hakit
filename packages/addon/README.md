# @hakit/addon

![HAKIT Logo](https://img.shields.io/badge/HAKIT-Editor-blue)
![npm version](https://img.shields.io/npm/v/@hakit/addon)
![License](https://img.shields.io/badge/license-Proprietary-red)

> [!WARNING]
> This package is still in active development, and not ready for public use.

Create [hakit.dev](https://hakit.dev) compatible addon repositories with a single command.

## Quick Start

Create a new HAKIT editor project using any of the following package managers:

### npm
```bash
npx @hakit/addon@latest
```

### Yarn
```bash
# Yarn 1.x (Classic)
yarn create @hakit/addon@latest

# Yarn 2+ (Berry) 
yarn dlx @hakit/addon@latest
```

### pnpm
```bash
# Using dlx
pnpm dlx @hakit/addon@latest
```

### Bun
```bash
bunx @hakit/addon@latest
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

## Component Styling

HAKIT supports emotion-based styling for components. For complete documentation, best practices, and important considerations about style inheritance, see [EMOTION_STYLING.md](./EMOTION_STYLING.md).

## Support

- 📖 [HAKIT Documentation](https://hakit.dev)
- 🐛 [Report Issues](https://github.com/shannonhochkins/hakit/issues)
- 💬 [Contribution / Development](./DEVELOPMENT.md)

