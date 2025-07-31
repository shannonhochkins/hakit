# @hakit/addon

![HAKIT Logo](https://img.shields.io/badge/HAKIT-Editor-blue)
![npm version](https://img.shields.io/npm/v/@hakit/addon)
![License](https://img.shields.io/badge/license-Proprietary-red)

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

## Development & Contributing

### Testing the Package

To test changes to the addon package:

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
npm install ../hakit-addon-1.0.0.tgz
npm run build
```

### Adding New Dependencies

### Project Structure

```
@hakit/addon/
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

- `@hakit/addon` - Create new projects
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

## Publishing

### Stable Release

To publish a new stable version of the addon package:

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.2.3"
   }
   ```

2. **Update CHANGELOG.md** with new features, fixes, and breaking changes:
   ```markdown
   ## [1.2.3] - 2025-07-30
   ### Added
   - New component scaffolding improvements
   ### Fixed
   - Fixed TypeScript declaration generation
   ### Changed
   - Updated dependency versions
   ```

3. **Build and test** the package:
   ```bash
   npm run build
   npm run test:script
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "chore(addon): release v1.2.3"
   ```

5. **Publish to npm**:
   ```bash
   npm publish
   ```
   
The stable release will be available via `npx @hakit/addon@latest`.

### Canary Release

To publish a canary/pre-release version for testing:

1. **Update version** with canary suffix:
   ```json
   {
     "version": "1.2.3-canary.1"
   }
   ```

2. **Build and test**:
   ```bash
   npm run build
   npm run test:script
   ```

3. **Publish with canary tag**:
   ```bash
   npm publish --tag canary
   ```

   Optionally, tag the commit for tracking:
   ```bash
   git tag @hakit/addon@1.2.3-canary.1
   git push origin main --tags
   ```

4. **Test canary version**:
   ```bash
   # Install specific canary version
   npx @hakit/addon@canary
   # Or specific version
   npx @hakit/addon@1.2.3-canary.1
   ```

**Note**: Canary versions will **not** be installed when users run `npx @hakit/addon@latest` - they must explicitly specify the canary tag or version number.


## Support

- 📖 [HAKIT Documentation](https://hakit.dev)
- 🐛 [Report Issues](https://github.com/shannonhochkins/hakit/issues)

