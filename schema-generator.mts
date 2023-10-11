import {
  resolve,
  join
} from "path";
import {
  readdir,
  stat,
  writeFile,
  mkdir
} from "fs/promises";
import {
  Plugin
} from 'vite';
import * as TJS from "typescript-json-schema";
import { JSONSchema7 } from "json-schema";

const schemasDir = resolve(__dirname, './client/schemas');
const widgetsDir = resolve(__dirname, './client/src/widgets');
const WARNING = '// these files are automatically generated, do not edit manually';

const BLACKLIST_DEFINIITIONS = [
  'React.ReactNode',
  'React.ReactElement<any,string|React.JSXElementConstructor<any>>',
  'React.ReactFragment',
  'React.ReactPortal',
  'EntityName',
];

const INTERNAL_SCHEMA_DEFINITIONS = [
  'entity',
  'service',
];

type UpdateCallback = (originalValue: any) => JSONSchema7['type'] | string;
type RemapTypes = Record<string, UpdateCallback>;

const REMAP_TYPES: RemapTypes = {
  'React.ReactNode': () => ['string', "null"],
  'color' : () => ['string', "null"],
  'textColor' : () => ['string', "null"],
  'iconColor' : () => ['string', "null"],
  '$ref': (originalValue: any) => {
    return '#' + (originalValue ?? '').split('#').pop()
  }
}

function updateValues(obj: any, keysToUpdate: string[], remapTypes: RemapTypes): TJS.Definition | null {
  // Base case: if obj is not an object or is null, return obj
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // Recursive case: iterate through keys in obj
  Object.keys(obj).forEach(key => {
    if (keysToUpdate.includes(key) && remapTypes[key]) {
      // Update the value of the key using the provided callback function
      obj[key] = remapTypes[key](obj[key]);
    } else if (Array.isArray(obj[key])) {
      // If the property is an array, iterate through its elements
      obj[key].forEach((item: any, index: number) => {
        if (typeof item === 'object' && item !== null) {
          // If the element is an object, recur on it
          updateValues(item, keysToUpdate, remapTypes);
        }
      });
    } else {
      // If the property is an object, recur on it
      updateValues(obj[key], keysToUpdate, remapTypes);
    }
  });

  return obj;
}


async function generateSchemaForFiles(file: string, basePath: string): Promise < TJS.Definition | null > {
  const program = TJS.getProgramFromFiles(
    [file], {
      "target": "es6",
      "module": "commonjs",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "jsx": "react-jsx",
      include: [file],
    },
    basePath
  );

  const settings: TJS.PartialArgs = {
    required: true,
    include: [file],
    id: file,
  };
  return TJS.generateSchema(program, "Schema", settings, [file]);
}

function isDefinition(value: TJS.DefinitionOrBoolean): value is TJS.Definition {
  return typeof value !== 'boolean';
}


const runNpmGenerateScript = (): Plugin => ({
  name: 'run-npm-generate-script',
  enforce: 'pre',
  async buildStart() {
    try {
      const files = await readdir(widgetsDir, { withFileTypes: true })
      const subDirectories = files.filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      // Ensure the schemas directory exists
      try {
        await mkdir(schemasDir, { recursive: true });
      } catch (err) {
        // Ignore the error if the directory already exists
      }

      let cases = ''; // This will store our import cases
      for (const subDir of subDirectories) {
        const targetFilePath = join(widgetsDir, subDir, 'index.tsx');
        const targetFileExists = await stat(targetFilePath);
        if (targetFileExists.isFile()) {
          const outputSchema = await generateSchemaForFiles(targetFilePath, join(widgetsDir, subDir));
          const schema = updateValues(outputSchema, Object.keys(REMAP_TYPES), REMAP_TYPES);
          if (!schema) {
            throw new Error(`Failed to generate schema for ${targetFilePath}`);
          }
          if (schema.properties) {
            Object.entries(schema.properties).forEach(([key, value]) => {
              const properties = schema.properties as Record<string, TJS.DefinitionOrBoolean>; // Type assertion
              if (isDefinition(value) && typeof value.$ref === 'string') {
                const remapped = REMAP_TYPES[value.$ref.split('/').pop() as string];
                if (remapped) {
                  delete value.$ref;
                  properties[key] = {
                    ...value,
                    type: remapped,
                  };
                } else {
                  value.$ref = '#' + value.$ref.split('#').pop();
                  properties[key] = value;
                }
              }
              if (INTERNAL_SCHEMA_DEFINITIONS.includes(key)) {
                delete properties[key];
                if (schema.required) {
                  schema.required = schema.required.filter(required => required !== key);
                }
              }
            });
          }

          // remove definitions we don't want in the schema
          BLACKLIST_DEFINIITIONS.forEach(definition => {
            if (schema.definitions?.[definition]) {
              delete schema.definitions[definition];
            }
          });
          if (schema.$id) {
            schema.$id = schema.$id.split(widgetsDir).pop();
          }
          


          // Prepare the content of the schema file
          const fileContent = `${WARNING}
export default ${JSON.stringify(schema, null, 2)};
`;
          // Write schema to the file
          const schemaFileName = `${subDir}.ts`;
          const schemaFilePath = join(schemasDir, schemaFileName);
          await writeFile(schemaFilePath, fileContent, 'utf8');

          // Add the case for this widget
cases += `case '${subDir}': {
      const imported = await import('./${subDir}');
      return imported.default as TJS.Definition;
    }`;
        }
      }

      // Now, generate the index.ts file with the loadSchema function
      const indexContent = `${WARNING}
import * as TJS from "typescript-json-schema";
const loadSchema = async (name: string): Promise<TJS.Definition> => {
  switch (name) {
    ${cases}
    default:
      throw new Error(\`Unknown widget: \${name}\`);
  }
};
export default loadSchema;
`;
      // Write the loadSchema function to the index.ts file in the schemas directory
      const indexPath = join(schemasDir, 'index.ts');
      await writeFile(indexPath, indexContent, 'utf8');

    } catch (error) {
      console.error(`Failed to run npm generate script`, error);
      throw error;
    }
  },
});

export default runNpmGenerateScript;
