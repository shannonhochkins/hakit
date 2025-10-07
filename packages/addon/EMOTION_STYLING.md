# Emotion-Based Component Styling

Hakit supports emotion-based styling for components, providing CSS-in-JS styling with automatic class name generation to avoid global naming conflicts.

## ⚠️ Important: Style Inheritance and Nested Components

**CRITICAL WARNING**: While emotion generates unique class names, styles can still affect nested components through normal CSS inheritance and cascade rules.

### 🚨 Style Inheritance Issues

When your component contains **dropzones** with child components, your component's styles **WILL affect child components** if:

- You use element selectors (`div`, `h1`, `p`, etc.)
- You use broad selectors (`*`, descendant selectors)
- CSS properties inherit naturally (color, font-family, etc.)

**Example of problematic styles:**
```typescript
styles(props) {
  return `
    background: red;
    
    /* ❌ DANGEROUS: This will style ALL h1 elements inside, including in child components */
    h1 {
      color: blue;
      font-size: 2rem;
    }
    
    /* ❌ DANGEROUS: This affects all paragraphs in nested components */
    p {
      margin: 0;
    }
    
    /* ❌ DANGEROUS: Universal selector affects child components */
    * {
      box-sizing: border-box;
    }
  `;
}
```

### ✅ Best Practices for Safe Styling

1. **Use Direct Child Selectors (`>`)** to limit scope:
```typescript
styles(props) {
  return `
    background: red;
    
    /* ✅ SAFE: Only affects direct h1 children */
    > h1 {
      color: blue;
    }
    
    /* ✅ SAFE: Only affects direct paragraph children */
    > p {
      margin: 0;
    }
  `;
}
```

2. **Use CSS Classes for Nested Elements**:
```typescript
export function Render(props: RenderProps<MyComponentProps>) {
  return (
    <>
      <h1 className="unique-class-name">{props.text}</h1>
    </>
  );
}

// Target your specific classes
styles(props) {
  return `
    background: red;
    
    /* ✅ SAFE: Only affects elements with this class */
    .unique-class-name {
      color: blue;
    }
    
  `;
}
```

3. **Be Careful with Inherited Properties**:
```typescript
export function Render(props: RenderProps<MyComponentProps>) {
  return (
    <div className="my-content">
      {/* This will not inherit styles from the parent component */}
      <h1 className="unique-class-name">{props.text}</h1>
    </div>
  );
}
styles(props) {
  return `
    /* ⚠️ WARNING: These properties inherit to all children */
    color: blue;           /* Inherits to all text */
    font-family: Arial;    /* Inherits to all text */
    line-height: 1.5;      /* Inherits to all elements */
    
    /* ✅ BETTER: Scope inherited properties */
    > * {
      color: blue;
      font-family: Arial;
    }
  `;
}
```

4. **Use CSS Custom Named Properties for Theme Values**:
```typescript
styles(props) {
  return `
    --componentName-bg: ${props.backgroundColor};
    --componentName-text: ${props.textColor};
    
    background: var(--componentName-bg);
    
    /* Child components can opt-in to using these variables */
    > .title {
      color: var(--componentName-text);
    }
  `;
}
```

## Recommended Approach: Individual Styled Components

**The safest and most flexible approach** is to define individual styled components using `@emotion/styled`. This completely eliminates inheritance issues since each element has its own scoped styles.

```typescript
import styled from '@emotion/styled';
import { ComponentConfig, RenderProps, Slot } from '@hakit/addon';

// Define individual styled components - these are completely isolated
const CardContainer = styled.div<{ backgroundColor?: string; isHighlighted?: boolean }>`
  background: ${props => props.backgroundColor || 'white'};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  ${props => props.isHighlighted && `
    border: 2px solid #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h1<{ titleColor?: string; size?: 'small' | 'medium' | 'large' }>`
  color: ${props => props.titleColor || '#333'};
  margin: 0 0 1rem 0;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '1.2rem';
      case 'large': return '2.5rem';
      default: return '1.8rem';
    }
  }};
  font-weight: 600;
`;

const CardContent = styled.div`
  padding: 1rem 0;
  
  /* ✅ Safe: These styles only affect this specific container */
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

interface MyComponentProps {
  title?: string;
  backgroundColor?: string;
  titleColor?: string;
  titleSize?: 'small' | 'medium' | 'large';
  isHighlighted?: boolean;
  primaryAction?: string;
  secondaryAction?: string;
  content: Slot
}

export function Render({
  props,
  content: Content, // slot content
}: RenderProps<MyComponentProps>) {
  return (
    <CardContainer 
      backgroundColor={props.backgroundColor}
      isHighlighted={props.isHighlighted}
    >
      <CardTitle 
        titleColor={props.titleColor}
        size={props.titleSize}
      >
        {props.title || 'Default Title'}
      </CardTitle>
      
      <CardContent>
        <p>This content area is completely isolated from parent/child components.</p>
        
        {/* child components through slots shouldn't inherit styles */}
        <Content />
      </CardContent>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        {props.primaryAction && (
          <ActionButton variant="primary">
            {props.primaryAction}
          </ActionButton>
        )}
        {props.secondaryAction && (
          <ActionButton variant="secondary">
            {props.secondaryAction}
          </ActionButton>
        )}
      </div>
    </CardContainer>
  );
}

export const config: ComponentConfig<MyComponentProps> = {
  label: 'Safe Styled Card',
  fields: {
    title: { type: 'text', label: 'Title', default: 'My Card' },
    backgroundColor: { type: 'text', label: 'Background Color', default: '#ffffff' },
    titleColor: { type: 'text', label: 'Title Color', default: '#333333' },
    titleSize: { 
      type: 'select', 
      label: 'Title Size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ],
      default: 'medium'
    },
    isHighlighted: { type: 'boolean', label: 'Highlighted', default: false },
    primaryAction: { type: 'text', label: 'Primary Action Text' },
    secondaryAction: { type: 'text', label: 'Secondary Action Text' }
  },
  render: Render,
};
```

### Benefits of Individual Styled Components:

- **🛡️ Complete Isolation**: No inheritance issues - each styled component is completely scoped
- **🎯 Precise Control**: Style exactly what you want without worrying about child components
- **🧩 Reusable**: Styled components can be reused across different parts of your component
- **📝 Type Safety**: Full TypeScript support with prop types for dynamic styling
- **🚀 Performance**: Emotion optimizes styled components for better performance
- **🔧 Debugging**: Easier to debug since styles are co-located with components

### When to Use Each Approach:

| Approach | Use When | Pros | Cons |
|----------|----------|------|------|
| **Individual Styled Components** ✅ | You want complete control and safety | No inheritance issues, type-safe, reusable | More verbose, requires passing props |
| **`styles` Function** | Quick dynamic styling on root element | Simple, less code, good for basic theming | Can cause inheritance issues if not careful |

## Alternative: Hybrid Approach

You can also combine both approaches for maximum flexibility:

```typescript
const CardContainer = styled.div`
  /* Static base styles that never change */
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export const config: ComponentConfig<MyComponentProps> = {
  // ... fields ...
  
  // Use styles function for dynamic root-level styling
  styles(props) {
    return `
      background: ${props.backgroundColor};
      border: ${props.hasBorder ? '2px solid #ccc' : 'none'};
      ${props.isHighlighted ? 'box-shadow: 0 0 0 3px #3b82f6;' : ''}
    `;
  },
  
  render: Render,
};
```

## Basic Usage

```typescript
import { ComponentConfig, RenderProps } from '@hakit/addon';

interface MyComponentProps {
  backgroundColor?: string;
  hasBorder?: boolean;
  text?: string;
}

export function Render(props: RenderProps<MyComponentProps>) {
  return (
    <div>
      <h1>{props.text}</h1>
      <p>This component uses scoped styling!</p>
    </div>
  );
}

export const config: ComponentConfig<MyComponentProps> = {
  label: 'Styled Component',
  fields: {
    backgroundColor: {
      type: 'text',
      label: 'Background Color',
      default: '#f0f0f0',
    },
    hasBorder: {
      type: 'boolean',
      label: 'Has Border',
      default: false,
    },
    text: {
      type: 'text',
      label: 'Title Text', 
      default: 'Hello World',
    },
  },
  // NEW: styles function for component-scoped CSS
  styles(props) {
    return `
      background-color: ${props.backgroundColor};
      ${props.hasBorder ? 'border: 2px solid #333;' : ''}
      padding: 20px;
      border-radius: 8px;
      margin: 10px 0;
      
      h1 {
        color: #333;
        margin: 0 0 10px 0;
        font-size: 1.5rem;
      }
      
      p {
        color: #666;
        margin: 0;
        font-style: italic;
      }
      
      /* Hover effects work too! */
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
    `;
  },
  render: Render,
};
```

## Key Features

- **🎯 Unique Class Names**: Emotion generates unique CSS class names to avoid global conflicts
- **⚡ Dynamic Styling**: Styles react to prop changes automatically  
- **⚠️ Inheritance Aware**: Styles follow normal CSS cascade and inheritance rules - see warnings above
- **🏎️ Emotion Powered**: Uses emotion under the hood for performance
- **🔄 Automatic Application**: Styles are automatically attached to your component's root element

## How It Works

1. Define a `styles` function in your component config
2. The function receives the component props (including internal props)
3. Return a CSS string with your styles
4. Hakit automatically generates emotion CSS and applies it to your component
5. Styles are re-generated whenever props change

## Best Practices

- Use CSS variables for theme consistency
- Leverage the `&` selector for pseudo-states like hover
- Keep styles specific to avoid conflicts
- Use prop-based conditional styling for dynamic behavior

## Advanced Responsive Example 

```typescript
styles(props) {
  return `
    /* Base styles */
    padding: 1rem;
    background: ${props.backgroundColor || 'white'};
    
    /* Enable container queries for this component */
    container-type: inline-size;
    
    /* Responsive styles using container queries */
    @container (max-width: 300px) {
      padding: 0.5rem;
      font-size: 0.9rem;
      
      > .card-title {
        font-size: 1.2rem;
      }
    }
    
    @container (min-width: 500px) {
      padding: 2rem;
      font-size: 1.1rem;
      
      > .card-title {
        font-size: 2rem;
      }
    }
    
    @container (min-width: 800px) {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    
    /* Dynamic theming based on props */
    --card-primary: ${props.primaryColor || '#3b82f6'};
    --card-radius: ${props.rounded ? '12px' : '4px'};
    
    border-radius: var(--card-radius);
    border: 2px solid var(--card-primary);
    
    /* Safe nested element styles using direct child selectors */
    > .card-title {
      color: ${props.hasBorder ? '#333' : '#666'};
      margin: 0 0 1rem 0;
      transition: font-size 0.2s ease;
    }
    
    /* Conditional styling based on state */
    ${props.isHighlighted ? `
      box-shadow: 0 0 0 3px var(--card-primary, #3b82f6);
      transform: scale(1.02);
    ` : ''}
    
    /* Pseudo-states for interactivity */
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    }
  `;
}
```

## 📋 Complete Style Safety Checklist

### ❌ Never Do This (Will Affect Child Components)

```typescript
styles(props) {
  return `
    /* ❌ Element selectors affect ALL matching elements in child components */
    div { background: red; }
    h1 { color: blue; }
    p { margin: 0; }
    button { padding: 10px; }
    
    /* ❌ Universal selectors affect everything */
    * { box-sizing: border-box; }
    
    /* ❌ Descendant selectors affect deeply nested elements */
    .container span { color: red; }
    
    /* ❌ Inherited properties without scoping */
    color: blue;
    font-family: Arial;
    line-height: 1.5;
  `;
}
```

### ✅ Always Do This (Safe Practices)

```typescript
styles(props) {
  return `
    /* ✅ Direct child selectors only affect immediate children */
    > div { background: red; }
    > h1 { color: blue; }
    > .my-class { margin: 0; }
    
    /* ✅ Class-based targeting with your own classes */
    .component-header { font-size: 2rem; }
    .component-body { padding: 1rem; }
    
    /* ✅ Pseudo-selectors on the root element */
    &:hover { transform: scale(1.05); }
    &:focus { outline: 2px solid blue; }
    &.active { background: green; }
    
    /* ✅ CSS custom properties for optional inheritance */
    --component-primary: ${props.primaryColor};
    --component-spacing: 1rem;
  `;
}
```

### 🔧 Slot-Safe Component Example

```typescript

interface MyComponentProps {
  title?: string;
  backgroundColor?: string;
  titleColor?: string;
  isHighlighted?: boolean;
  primaryAction?: string;
  secondaryAction?: string;
  content: Slot;
  footer: Slot;
}
export function Render({
  props,
  content: Content, // slot content
  footer: Footer, // slot footer
}: RenderProps<MyComponentProps>) {
  return (
    <div className="card-container">
      <header className="card-header">
        <h1 className="card-title">{props.title}</h1>
      </header>
      <main className="card-content">
        {/* This slot content will be safe from our styles */}
        <Content />
      </main>
      <footer className="card-footer">
        <Footer />
      </footer>
    </div>
  );
}

export const config: ComponentConfig<MyComponentProps> = {
  // ... fields ...
  styles(props) {
    return `
      /* ✅ Safe: Only affects the root container */
      background: ${props.backgroundColor};
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      /* ✅ Safe: Direct child selectors */
      > .card-header {
        border-bottom: 1px solid #eee;
        padding: 1rem;
      }
      
      > .card-content {
        padding: 1rem;
        /* Child components in this dropzone won't inherit these styles */
      }
      
      > .card-footer {
        border-top: 1px solid #eee;
        padding: 0.5rem 1rem;
      }
      
      /* ✅ Safe: Target specific classes only */
      .card-title {
        margin: 0;
        color: ${props.titleColor};
      }
      
      /* ✅ Safe: Pseudo-states on root */
      &:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
    `;
  },
  render: Render,
};
```

## 🚨 Common Mistakes and Solutions

| ❌ Problematic | ✅ Safe Alternative | Why |
|---------------|-------------------|-----|
| `h1 { color: red; }` | `.my-title { color: red; }` or `> h1 { color: red; }` | Element selector affects all h1s in child components |
| `* { margin: 0; }` | `> * { margin: 0; }` | Universal selector resets everything in child components |
| `color: blue;` | `> .content { color: blue; }` | Color inherits to all child text elements |
| `.button { padding: 10px; }` | `.my-button { padding: 10px; }` | Generic class names might match child component classes |
| `div > span { ... }` | `> div > span { ... }` | Descendant selector affects nested structures |

## 📚 Additional Resources

- [CSS Inheritance Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance)
- [CSS Specificity Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [Emotion Documentation](https://emotion.sh/docs/introduction)
