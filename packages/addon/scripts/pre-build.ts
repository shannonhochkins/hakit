// copied the ../../editor/src/components/hakit-addon-shared.tsx file

// locate the file, throw an error if it is not found
// copy the file to the addon/shared-components folder named index.tsx
// copy the file to the addon/shared-utils folder named index.tsx

import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const editorSharedPath = join(__dirname, '../../editor/src/hakit-addon-shared.tsx');
const editorUtilsPath = join(__dirname, '../../editor/src/hakit-addon-utils.tsx');
const addonSharedPath = join(__dirname, '../shared/components.tsx');
const addonUtilsPath = join(__dirname, '../shared/utils.tsx');

if (!existsSync(editorSharedPath)) {
  throw new Error(`Source file not found: ${editorSharedPath}`);
}

if (!existsSync(editorUtilsPath)) {
  throw new Error(`Source file not found: ${editorUtilsPath}`);
}

copyFileSync(editorUtilsPath, addonUtilsPath);
console.log(`Copied shared utils from ${editorUtilsPath} to ${addonUtilsPath}`);

copyFileSync(editorSharedPath, addonSharedPath);
console.log(`Copied shared components from ${editorSharedPath} to ${addonSharedPath}`);
