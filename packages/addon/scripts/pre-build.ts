// copied the ../../editor/src/components/hakit-addon-shared.tsx file

// locate the file, throw an error if it is not found
// copy the file to the addon/shared-components folder named index.tsx

import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const editorSharedPath = join(__dirname, '../../editor/src/components/hakit-addon-shared.tsx');
const addonSharedPath = join(__dirname, '../shared-components/index.tsx');

if (!existsSync(editorSharedPath)) {
  throw new Error(`Source file not found: ${editorSharedPath}`);
}

copyFileSync(editorSharedPath, addonSharedPath);
console.log(`Copied shared components from ${editorSharedPath} to ${addonSharedPath}`);
