# Development Guide

This guide provides comprehensive information for developing addons for [hakit.dev](https://hakit.dev).


## Getting Started

### Development Server

Start the development server and print out a manifest url to use with the [Module Federation DevTools](#module-federation-devtools):

> Note: The dev flow will only work once the addon is installed in [hakit.dev](https://hakit.dev) at least once.

```bash
npm run dev
```

Options available:
- `--port <number>` - Change development port (default: 3000)
- `--host <host>` - Change host (default: localhost)
- `--debug` - Enable debug logging

Example:
```bash
npm run dev --port 3001 --host 0.0.0.0
```

### Building Components

Build a versioned zip package of your components for distribution:

```bash
npm run build
```

This creates a `.zip` file in the `versions/` directory that can be uploaded to [hakit.dev](https://hakit.dev).

Options:
- `--debug` - Enable debug logging during build

### Creating New Components

Generate a new component using the scaffolding tool:

```bash
npm run create-component
```

This will prompt you for a component name and create the necessary files automatically.

### Available Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build and package components for distribution  
- `npm run create-component` - Generate a new component
- `npm run dev --help` - Show development server options
- `npm run build --help` - Show build command options

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
    <div className={props.title} {...props}>
      <h1>YourComponentName</h1>
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
  render: Render,
};

```

## Development Tips

### Module Federation DevTools

Install the [Module Federation DevTools](https://chromewebstore.google.com/detail/module-federation/aeoilchhomapofiopejjlecddfldpeom) Chrome extension to debug and inspect your components during development.

Once logged into [hakit.dev](https://hakit.dev), and your addon is installed at least once using the versioned zip, you can use the chrome extension above to dynamically replace the addon with your local development server manifest URL which you can retreive by running 
```bash
npm run dev
```

Then in the chrome extension, simply pick your addon from the dropdown menu and provide your manifest url and [hakit.dev](https://hakit.dev) will load your local development server instead of the installed version which is very useful for testing changes in real-time.


### @hakit/core Integration

This project is set up to work seamlessly with @hakit/core. To see documentation on all the available hooks and utilities, visit the [@hakit](https://shannonhochkins.github.io/ha-component-kit).

Use @hakit/core hooks and utilities:

```tsx
import { useEntity, type EntityName } from '@hakit/core';

export const SomeComponent: React.FC<{ entityId: EntityName }> = ({ entityId }) => {
  const entity = useEntity(entityId);

  if (!entity) {
    return <div>Entity not found: {entityId}</div>;
  }

  return (
    <div>
      <h3>{entity.attributes.friendly_name}</h3>
      <p>State: {entity.state}</p>
    </div>
  );
};
```

## Building and Packaging

#### Build

```bash
npm run build
```

Options:
- `--debug` - Enable debug logging during build

This creates:
- `versions/vX.X.X.zip` - Distributable package

#### Version Management

Update your `package.json` version before building:
```json
{
  "version": "1.2.3"
}
```

The build will create `versions/v1.2.3.zip` automatically.

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

## Deployment

### Package Distribution

1. **Update version** in `package.json`
2. **Build package**: `npm run build`
3. **Upload** `versions/vX.X.X.zip` to [hakit.dev](https://hakit.dev)
4. **Test** in live environment

### Version Strategy

- **Patch (1.0.1)**: Bug fixes, minor updates
- **Minor (1.1.0)**: New features, non-breaking changes  
- **Major (2.0.0)**: Breaking changes, major refactors

