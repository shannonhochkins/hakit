# Development Guide

This guide provides comprehensive information for developing addons for [hakit.dev](https://hakit.dev).

> [!IMPORTANT]
> Install the [Module Federation DevTools](https://chromewebstore.google.com/detail/module-federation/aeoilchhomapofiopejjlecddfldpeom) Chrome extension to facilitate local development and testing of your addons.


## Getting Started

### Development

Start the development by running:

```bash
npm run dev
```

This will start a local development, which doesn't do anything until you connect it to [hakit.dev](https://hakit.dev) using the [Module Federation DevTools](#module-federation-devtools) chrome extension.


### Building Addon Package

Build a versioned zip package of your components for distribution:

1. Update your `package.json` version before building:
```json
{
  "version": "1.2.3"
}
```

> You should follow [Semantic Versioning](https://semver.org/) for version numbers.

2. The build will create `versions/v1.2.3.zip` automatically after running:

```bash
npm run build
```

This creates a `.zip` file in the `versions/` directory, you must commit and push the `versions/` directory to your git repository so that [hakit.dev](https://hakit.dev) can access the built package when installing your addon.

To install your addon, simply navigate to [hakit.dev](https://hakit.dev/me/addons/install), and provide your github repository URL, example: `https://github.com/username/repo`, you don't need to provide the "version", it will automatically install the latest version available that's linked via the `package.json`.


### Creating New Components

Generate a new component using the scaffolding tool:

```bash
npm run create-component
```

This will prompt you for a component name and create the necessary files automatically.


### Project Structure

This structure is important for proper Module Federation and component organization. Components should be clearly organized under the `components/` directory for maintainability and discoverability.

The `npm run create-component` command will automatically create components directly under the `components/` folder. If you prefer to create components manually, you can organize them in any folder structure as long as the `manifest.json` is updated to point to the correct file path.

```
DefaultProjectName/
├── package.json          # Project configuration and dependencies
├── tsconfig.json         # TypeScript configuration
├── manifest.json         # Component registration (add new components here)
├── README.md             # Project overview and quick start
├── DEVELOPMENT.md        # This file - detailed development docs
├── src/
│   ├── index.tsx         # Module Federation entry point
│   └── components/
│       └── DefaultComponentName/
│           └── index.tsx # Your first component
└── versions/             # Built component packages (.zip files)
```

## Component Development

### Component Requirements

Each component should:
- Export a named `config` constant
- Use TypeScript for type safety
- Be registered in `manifest.json`

### Component Registration

The `npm run create-component` command will automatically register new components for you. However, if you're adding components manually, you'll need to update the `manifest.json` file:

```json
{
  "components": [
    {
      "name": "DefaultComponentName", 
      "src": "./src/components/DefaultComponentName/index.tsx"
    },
    {
      "name": "YourNewComponent",
      "src": "./src/components/YourNewComponent/index.tsx"
    }
  ]
}
```

Each component entry requires:
- `name` - The component name (must match your exported component)
- `src` - Relative path to the component file

### Creating Components Manually

If you prefer not to use the scaffolding tool:

1. Create component directory: `src/components/MyComponent/`
2. Create `index.tsx` with your component
3. Add to `manifest.json`

### Component Structure

Each component should follow this pattern:

```tsx
import { ComponentConfig, RenderProps } from '@hakit/addon';

interface YourComponentNameProps {
  // Add your props here
  title?: string;
}

export function Render(props: RenderProps<YourComponentNameProps>) {
  return (
    <div>
      <h1>YourComponentName - {props.title}</h1>
      <p>Your component implementation goes here.</p>
    </div>
  );
}

// Example component configuration
export const config: ComponentConfig<YourComponentNameProps> = {
  label: 'Your Component Name',
  fields: {
    title: {
      type: 'text',
      label: 'Title',
      default: '',
    },
  },
  styles() {
    return `
      color: red; 
    `;
  }
  render: Render,
};

```

> [!TIP]
> Your Render function should export a single react component, if you export a Fragment, multiple elements, or a function component (<Component />), hakit will wrap it in a div automatically which may cause layout issues.

## Development Tips

### Module Federation DevTools

If you haven't already, install the [Module Federation DevTools](https://chromewebstore.google.com/detail/module-federation/aeoilchhomapofiopejjlecddfldpeom) Chrome extension.



Once logged into [hakit.dev](https://hakit.dev), then in the chrome extension, simply pick your addon from the dropdown menu and provide your manifest url and [hakit.dev](https://hakit.dev) will load your local development server instead of the installed version which is very useful for testing changes in real-time.

> If you have not installed this addon yet, you can pick @hakit/dev-remote-proxy which is a dummy remote that will allow you to preview your components in the editor.


### @hakit/core Integration

This project is set up to work seamlessly with @hakit/core. To see documentation on all the available hooks and utilities, visit the [@hakit](https://shannonhochkins.github.io/ha-component-kit).

Use @hakit/core hooks and utilities:

```tsx
import { useEntity, type EntityName } from '@hakit/core';

export const SomeComponent: React.FC<{ entityId: EntityName }> = ({ entityId }) => {
  const entity = useEntity(entityId);

  if (!entity) {
    return null;
  }

  return (
    <div>
      <h3>{entity.attributes.friendly_name}</h3>
      <p>State: {entity.state}</p>
    </div>
  );
};
```


### Package.json

The `package.json` file is processed during install, so things like the author, description, name, version are pulled through to [hakit.dev](https://hakit.dev) when the addon is installed, ensure you keep this up to date.

```json
{
  "name": "@hakit/your-addon",
  "version": "1.0.0",
  "description": "Your addon description",
  "author": "Mr Fancy Pants"
}
```

### Available Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build and package components for distribution  
- `npm run create-component` - Generate a new component
- `npm run dev --help` - Show development server options
- `npm run build --help` - Show build command options


#### Development Server

```bash
npm run dev
```

Options available:
- `--port <number>` - Change development port (default: 5000)
- `--host <host>` - Change host (default: localhost)
- `--debug` - Enable debug logging

Example:
```bash
npm run dev --port 3001 --host 0.0.0.0
```

#### Build

```bash
npm run build
```

Options available:
- `--debug` - Enable debug logging during build

Example:
```bash
npm run build --debug
```