# Adding New Field Types to HAKIT Editor

This guide walks you through the process of adding a new field type to the HAKIT editor system. We'll use the recent addition of the `switch` field type as an example.

## Overview

The HAKIT editor uses a custom field system built on top of Puck's field system. Adding a new field type requires updates to several files across the codebase.

## Required Files to Modify

When adding a new field type, you need to update these files in the following order:

### 1. Type Definitions (`packages/shared/typings/fields.ts`)

First, define the TypeScript interface for your new field type:

```typescript
export type SwitchField = BaseField & {
  type: 'switch';
  // Add any specific properties for your field type here
};
```

Then add it to the `CustomFields` union type:

```typescript
export type CustomFields<
  Props extends DefaultComponentProps = DefaultComponentProps,
  E extends DefaultComponentProps = DefaultComponentProps,
  DataShape = unknown,
> =
  | (Omit<TextField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  | (Omit<NumberField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  // ... other existing fields
  | (Omit<SwitchField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E) // Add your new field here
  | (Omit<DividerField, ExcludePuckKeys> & ExtendedFieldTypes<DataShape> & E)
  // ... rest of the union
```

### 2. Icon Mapping (`packages/editor/src/helpers/editor/createCustomField/index.tsx`)

Add an icon for your field type to the `ICON_MAP`:

```typescript
import { CheckCircle } from 'lucide-react'; // Import your chosen icon

const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
  text: <Type size={16} />,
  number: <Hash size={16} />,
  // ... other existing mappings
  switch: <CheckCircle size={16} />, // Add your field's icon
  hidden: <Hash size={16} />,
};
```

### 3. Form Component (if needed)

If you're creating a completely new field type that doesn't exist in the `packages/editor/src/components/Form/Fields/` directory, you'll need to create a new form component:

**Create: `packages/editor/src/components/Form/Fields/YourFieldName/index.tsx`**

```typescript
import React from 'react';
// Import necessary dependencies

export interface YourFieldProps {
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  name?: string;
  id?: string;
  // Add other props specific to your field
}

export const YourField = ({
  value,
  onChange,
  readOnly = false,
  name,
  id,
  ...props
}: YourFieldProps) => {
  return (
    // Your field implementation
    <div>Your Custom Field</div>
  );
};
```

**Note:** For the `switch` field example, we used an existing `SwitchField` component and only needed to add the `readOnly` prop and wire it up properly.

### 4. Custom Auto Field Integration (`packages/editor/src/helpers/editor/createCustomField/CustomAutoField/index.tsx`)

Add the import for your field component and handle the field type in the `CustomAutoField` component:

```typescript
// Add import
import { YourField } from '@components/Form/Fields/YourField';

// Add the field type handler
export function CustomAutoField<Props extends DefaultComponentProps>({ field, name, value, onChange }: CustomAutoFieldProps<Props>) {
  // ... existing code

  if (field.type === 'yourFieldType') {
    return (
      <YourField
        value={_value}
        name={field.name}
        readOnly={field.readOnly}
        id={field.id}
        onChange={newValue => {
          _onChange(newValue);
        }}
        // Add any other props specific to your field
      />
    );
  }

  // ... rest of the function
}
```

For the switch field example:
```typescript
import { SwitchField } from '@components/Form/Fields/Switch';

if (field.type === 'switch') {
  return (
    <SwitchField
      checked={_value}
      name={field.name}
      readOnly={field.readOnly}
      id={field.id}
      onChange={e => {
        const checked = (e.target as HTMLInputElement).checked;
        _onChange(checked);
      }}
    />
  );
}
```

### 5. Responsive Values Configuration (Optional)

If your field type should NOT support responsive values (different values at different breakpoints), add it to the exclusion list in `packages/editor/src/helpers/editor/pageData/constants.ts`:

```typescript
export const EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES: readonly FieldTypes[] = [
  'object', 
  'array', 
  'divider', 
  'hidden',
  'yourFieldType' // Add here if it shouldn't support responsive values
] as const;
```

## Step-by-Step Example: Adding a Switch Field

Here's how the `switch` field was added:

### Step 1: Type Definition
```typescript
// In packages/shared/typings/fields.ts
export type SwitchField = BaseField & {
  type: 'switch';
};
```

### Step 2: Icon Mapping
```typescript
// In packages/editor/src/helpers/editor/createCustomField/index.tsx
import { CheckCircle } from 'lucide-react';

const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
  // ... existing mappings
  switch: <CheckCircle size={16} />,
  // ... rest
};
```

### Deploy the addon

As the changes impact component configuration, the @hakit/addon package within this repository needs to be built and released.