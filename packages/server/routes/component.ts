import { Hono} from 'hono';
import { getUser } from "../kinde";
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import t from '@babel/types';
import { uploadFile } from '../helpers/gcloud-file';
import { fromError } from 'zod-validation-error';
import { componentsTable } from '../db/schema/db';
import { v4 as uuidv4 } from 'uuid';
import { formatErrorResponse } from '../helpers/formatErrorResponse';


/**
 * This matches the top-level structure of your `ComponentConfig`.
 * For properties that were function references or complex generics,
 * we use `z.unknown()` (or `z.any()`) because we can't statically
 * validate the logic of those functions without execution.
 */
export const componentSchema = z.object({
  // `version` is a string, needs to be present
  version: z.string({
    required_error: 'Version is required',
  }),
  // `render` is typically a function (PuckComponent). 
  // In a safe, non-executing scenario, treat as unknown or store as string.
  render: z.unknown({
    required_error: 'Render function is required',
  }),
  
  // label needs to be present
  label: z.string({
    required_error: 'Label is required',
  }),

  description: z.string({
    required_error: 'Description is required',
  }),

  // Typically an object, but we don't have a precise shape, so unknown/any
  defaultProps: z.unknown({
    invalid_type_error: 'Default props must be an object',
  }).optional(),
  
  // `fields` might be quite complex (e.g., a record of nested objects).
  // You could refine it if you have a known shape.
  fields: z.unknown({
    invalid_type_error: 'Fields must be an object',
  }).optional(),
  
  // `permissions` is a Partial<Permissions>. If you know your Permissions shape, 
  // you can define it here. For now, assume unknown.
  permissions: z.object({
    drag: z.boolean({
      invalid_type_error: 'drag must be a boolean'
    }).optional(),
    duplicate: z.boolean({
      invalid_type_error: 'duplicated must be a boolean'
    }).optional(),
    delete: z.boolean({
      invalid_type_error: 'delete must be a boolean'
    }).optional(),
    edit: z.boolean({
      invalid_type_error: 'edit must be a boolean'
    }).optional(),
    insert: z.boolean({
      invalid_type_error: 'insert must be a boolean'
    }).optional(),
  }, {
    invalid_type_error: 'Permissions must be an object',
  }).optional(),

  // Optional boolean
  inline: z.boolean({
    invalid_type_error: 'Inline must be a boolean',
  }).optional(),

  // The three "resolve" properties are typically functions returning promises/objects,
  // so we can treat them as unknown or as strings if you want the user to upload code as text.
  resolveFields: z.unknown({
    invalid_type_error: 'resolveFields must be a function'
  }).optional(),
  resolveData: z.unknown({
    invalid_type_error: 'resolveData must be a function'
  }).optional(),
  resolvePermissions: z.unknown({
    invalid_type_error: 'resolvePermissions fields must be a function'
  }).optional(),
});



// const packageSchema = z.object({
//   version: z.string({
//     required_error: 'Version is required in package.json',
//   }),
// });

// Schema for manifest.json for github urls
const manifestSchema = z.object({
  homeAssistantVersion: z.string({
    required_error: '"homeAssistantVersion" version is required in manifest.json',
  }),
  componentPaths: z.array(z.string({
    required_error: '"componentPaths" area required in manifest.json and should point to local files in the repository',
  }))
});


// Utility function to parse the GitHub URL and extract owner, repo, and branch.
function parseGitHubUrl(url: string): { owner: string; repo: string; branch: string } {
  try {
    const parsedUrl = new URL(url);
    // Remove any trailing slash and split the path segments.
    const pathParts = parsedUrl.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL.');
    }
    const owner = pathParts[0];
    const repo = pathParts[1];
    // Look for a branch indicator (e.g., /tree/branchName)
    let branch = 'main'; // default branch
    const treeIndex = pathParts.indexOf('tree');
    if (treeIndex !== -1 && pathParts.length > treeIndex + 1) {
      branch = pathParts[treeIndex + 1];
    }
    return { owner, repo, branch };
  } catch (error) {
    throw new Error('Invalid GitHub URL format.');
  }
}

// Utility function to fetch a file from GitHub's raw URL endpoint.
async function fetchFile(owner: string, repo: string, branch: string, filepath: string): Promise<{
  mimeType: string;
  content: string;
}> {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
  const response = await fetch(rawUrl, {
    headers: { 'Cache-Control': 'no-cache' },
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filepath} from GitHub. Status: ${response.status}`);
  }
  const mimeType = response.headers.get('content-type');
  const content = await response.text();
  return { mimeType: mimeType ?? 'text/plain', content };
}

// Lock down the global environment—this is recommended to harden built‐ins.
/**
 * Recursively converts a Babel ObjectExpression or ArrayExpression into a plain JS value.
 * Throws an error on unsupported node types (functions, identifiers, etc.).
 */
export function convertAstNodeToValue(node: t.Node): any {
  switch (node.type) {
    case 'UnaryExpression':
    if (node.operator === '!') {
      // Evaluate the operand, e.g., !0 => true, !1 => false
      const operandValue = convertAstNodeToValue(node.argument); 
      // If node.argument is a NumericLiteral(0), that's `false`; !false => true
      // Or if node.argument is a BooleanLiteral, etc.

      // A very naive approach:
      return !operandValue;
    }
    throw new Error(`Unsupported unary operator: ${node.operator}`);
    case 'ObjectExpression': {
      const obj: Record<string, any> = {};
      for (const prop of node.properties) {
        if (prop.type === 'ObjectProperty') {
          // Key must be an Identifier or a StringLiteral
          let key: string;
          if (t.isIdentifier(prop.key)) {
            key = prop.key.name;
          } else if (t.isStringLiteral(prop.key)) {
            key = prop.key.value;
          } else {
            throw new Error(`Unsupported object key type: ${prop.key.type}`);
          }

          obj[key] = convertAstNodeToValue(prop.value);
        } else if (prop.type === 'SpreadElement') {
          // If you want to allow spread, you can interpret prop.argument as another object
          const spreadValue = convertAstNodeToValue(prop.argument);
          if (typeof spreadValue === 'object' && !Array.isArray(spreadValue)) {
            Object.assign(obj, spreadValue);
          } else {
            throw new Error('Spread element must be an object');
          }
        } else {
          console.log('prop, prop', prop.key)
          // throw new Error(`Unsupported property type: ${prop.type} on key ${prop.key}`);
        }
      }
      return obj;
    }
    case 'ArrayExpression': {
      return node.elements.map(elem => {
        if (!elem) return null; // e.g. sparse arrays with empty slots
        if (t.isSpreadElement(elem)) {
          // similarly handle spread in arrays if desired
          throw new Error('Spread in arrays not supported by this example');
        } else {
          return convertAstNodeToValue(elem);
        }
      });
    }
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    default:
      // If you run into ArrowFunctionExpression, or any other function,
      // you'd either throw or store them as a string, depending on your needs.
      // throw new Error(`Unsupported node type: ${node.type}`);
      return null;
  }
}

/**
 * Locates and converts `export default { ... }` if it's an object/array literal.
 */
function extractDefaultExportObject(ast: t.File, filename: string) {
  let defaultLocalName: string | null = null;
  let defaultExportNode: t.ObjectExpression | null = null;
  // simple BFS or using @babel/traverse:
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const { specifiers } = path.node;
      for (const spec of specifiers) {
        // The `exported` identifier is the name on the "export" side
        // The `local` identifier is the name on the variable side
        if (
          t.isExportSpecifier(spec) &&
          t.isIdentifier(spec.exported) &&
          spec.exported.name === 'default'
        ) {
          // So "someVar" is re-exported as default
          if (t.isIdentifier(spec.local)) {
            defaultLocalName = spec.local.name; // e.g. "someVar"
          }
        }
      }
    }
  });
  if (defaultLocalName) {
    traverse(ast, {
      VariableDeclarator(path) {
        const varId = path.node.id;
        const init = path.node.init;
  
        if (
          t.isIdentifier(varId) &&
          varId.name === defaultLocalName &&
          t.isObjectExpression(init)
        ) {
          // Bingo
          defaultExportNode = init;
        }
      }
    });
  }

  if (!defaultExportNode) {
    throw new Error(`Uploaded component "${filename}" does not have a valid default export.`);
  }

  return convertAstNodeToValue(defaultExportNode);
}

function validateComponentCode(code: string, filename: string) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'] // adjust if needed
  });

  const result = extractDefaultExportObject(ast, filename);
  let parsed: ReturnType<typeof componentSchema.parse>;
  try {
    parsed = componentSchema.parse(result);
  } catch (e) {
    const validationError = fromError(e);
    throw new Error(validationError.toString());
  }
  return parsed;
}

interface Component {
  id: string;
  userId: string;
  name: string;
  objectKey: string;
  uploadType: 'zip' | 'github';
  version: string;
  createdAt: string;
  updatedAt: string;
}

const componentRoute = new Hono()
  .get('/', getUser, async (c) => {
    try {
      const user = c.var.user;
      // now select all the components
      const components = await db
        .select()
        .from(componentsTable)
        .where(eq(componentsTable.userId, user.id));
      return c.json({ components }, 200);
    } catch (error) {
      console.error(error);
      return c.json(formatErrorResponse('Component Error', error), 400);
    }
  })
  .get('/:componentId', getUser, async (c) => {
    c.json({ message: 'Hello, world!' }, 200);
  })
  .put('/:componentId', getUser, zValidator("param", z.object({
    componentId: z.string(),
  })), async (c) => {
    try {
      const user = c.var.user;
      const { componentId } = c.req.param();
  
      // Fetch the current component record from the database.
      const [currentComponent] = await db
        .select()
        .from(componentsTable)
        .where(eq(componentsTable.id, componentId));
      if (!currentComponent) {
        throw new Error('Component not found');
      }
  
      // Parse the incoming request body for the file.
      const body = await c.req.parseBody();
      if (!body.file || typeof body.file === 'string') {
        throw new Error('No file uploaded or wrong file type.');
      }

      if (body.file.type !== 'application/javascript') {
        throw new Error(`Invalid file type "${body.file.type}". Must be a JavaScript file.`);
      }
  
      // Read file contents and parse it to get the component data.
      const code = await body.file.text();
      const parsed = validateComponentCode(code, body.filename as string);
  
      // Check if the version already exists for this component.
      if (parsed.version === currentComponent.version) {
        throw new Error(`Version "${parsed.version}" already exists for the component "${parsed.label}".`);
      }
  
      // Upload the new file. This will create a new version in storage if using native versioning.
      const objectKey = await uploadFile({
        saveData: code,
        suffix: `components/${parsed.label}`,
        userId: user.id,
        contentType: body.file.type,
      });
      if (!objectKey) {
        throw new Error('Issue uploading file');
      }
  
      // Update the component record with the new file and version.
      const [updatedComponent] = await db
        .update(componentsTable)
        .set({
          name: parsed.label,
          objectKey,
          version: parsed.version,
        })
        .where(eq(componentsTable.id, componentId))
        .returning();
        
      return c.json({
        message: 'Component updated successfully.',
        component: updatedComponent,
      }, 200);
    } catch (e) {
      console.error(e);
      return c.json(formatErrorResponse('Component Update Error.', e), 400);
    }
  })
  .post('/upload/file', getUser, async (c) => {
    try {
      const user = c.var.user;
      const body = await c.req.parseBody();
      if (!body.file) {
        throw new Error('No file uploaded or wrong file type.');
      }
      if (typeof body.file === 'string') {
        throw new Error('Invalid file type. Must be a zip file.');
      }
      // the file should be a zip file mime type
      if (body.file.type !== 'application/zip') {
        throw new Error('Invalid file type. Must be a zip file.');
      }

      // Read the file contents in memory (as text)
      const code = await body.file.text();
      const parsed = validateComponentCode(code, body.filename as string);
      // it's been validated, now we can "safely" upload the component, then store the reference to the object key 
      // in the database
      const objectKey = await uploadFile({
        saveData: code,
        suffix: `components/${parsed.label}`,
        userId: user.id,
        contentType: 'application/javascript',
      });
      if (!objectKey) {
        throw new Error('Failed to upload file.');
      }
      const [componentRecord] = await db
        .insert(componentsTable)
        .values({
          id: uuidv4(),
          userId: user.id,
          name: parsed.label,
          objectKey,
          uploadType: 'zip',
          version: parsed.version,
        })
        .returning();

      return c.json({
        message: 'Created component successfully',
        component: componentRecord,
      }, 200);
    } catch (err) {
      console.error(err);
      return c.json(formatErrorResponse('Upload Component File', err), 500);
    }
  })
  .post('/upload/github', getUser, zValidator("json", z.object({
    githubUrl: z.string(),
  })), async (c) => {
    try {
      const user = c.var.user;
      const data = await c.req.valid('json');
      const { githubUrl } = data;
      // Expecting the GitHub URL along with the package and manifest JSONs in the request body.
      
      if (!githubUrl) {
        throw new Error('Missing GitHub URL');
      }
      const { owner, repo, branch } = parseGitHubUrl(githubUrl);

      // Fetch package.json and manifest.json from the repository.
      // let packageContent: string;
      let manifestContent: string;
      // try {
      //   const response = await fetchFile(owner, repo, branch, 'package.json');
      //   packageContent = response.content;
      // } catch (err: any) {
      //   return c.json({ error: `Error fetching package.json: ${err.message}` }, 400);
      // }
      try {
        const response = await fetchFile(owner, repo, branch, 'manifest.json');
        manifestContent = response.content;
      } catch (err) {
        throw new Error(`Error fetching manifest.json: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      
      // Parse the JSON contents.
      // let packageJson: any, manifestJson: any;
      let manifestJson: string;
      // try {
      //   packageJson = JSON.parse(packageContent);
      // } catch {
      //   return c.json({ error: 'Invalid JSON in package.json' }, 400);
      // }
      try {
        manifestJson = JSON.parse(manifestContent);
      } catch {
        throw new Error('Invalid JSON in manifest.json');
      }
      
      // Validate the package.json content.
      // const validatedPackage = packageSchema.parse(packageJson);
      
      // Validate the manifest.json content.
      const validatedManifest = manifestSchema.parse(manifestJson);

      let additionalComponents: Array<string[]> = [];
      if (validatedManifest.componentPaths && validatedManifest.componentPaths.length > 0) {
        const fetchPromises = validatedManifest.componentPaths.map(async (path) => {
          const response = await fetchFile(owner, repo, branch, path);
          return [response.content, path];
        });
        const results = await Promise.all(fetchPromises);
        results.forEach((code) => {
          additionalComponents.push(code);
        });
      }
      // Prepare all rows first
      const rowsToInsert = await Promise.all(
        additionalComponents.map(async ([componentCode, path]) => {
          const parsed = validateComponentCode(componentCode, path);
          // first, check if the component already exists
          const existingComponent = await db
            .select()
            .from(componentsTable)
            .where(and(eq(componentsTable.userId, user.id), eq(componentsTable.name, parsed.label)));
          if (existingComponent.length > 0) {
            throw new Error(`Component "${parsed.label}" already exists.`);
          }

          // upload the component, get the objectKey
          const objectKey = await uploadFile({
            saveData: componentCode,
            suffix: `components/${parsed.label}`,
            userId: user.id,
            contentType: 'application/javascript',
          });

          if (!objectKey) {
            throw new Error('Failed to upload file');
          }

          // Build the row to be inserted
          return {
            id: uuidv4(),
            userId: user.id,
            name: parsed.label,
            description: parsed.description,
            objectKey,
            uploadType: 'github',
            version: parsed.version,
          };
        })
      );



      // Now insert all of them in a single query
      await db
        .insert(componentsTable)
        .values(rowsToInsert);

      
      // At this point, you could add your logic to:
      // 1. Clone or fetch the repository using the provided githubUrl,
      // 2. Checkout the proper branch, tag, or commit,
      // 3. Read the file at validatedManifest.filepath as the component source,
      // 4. Store or process the component as needed.
      
      return c.json({
        message: 'Component uploaded successfully from GitHub',
      });
    } catch (err) {
      console.error(err);
      return c.json(formatErrorResponse('Upload Component GitHub', err), 400);
    }
  });

export default componentRoute;

