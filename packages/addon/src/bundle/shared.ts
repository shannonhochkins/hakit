import type { Manifest } from './types';
import chalk from 'chalk';

let DEBUG_MODE = false;

export function setDebugMode(debug: boolean): void {
  DEBUG_MODE = debug;
}

export function log(message: string, type: 'info' | 'error' = 'info'): void {
  if (DEBUG_MODE) {
    if (type === 'error') {
      console.error(chalk.red(message));
    } else {
      console.log(message);
    }
  }
}

export function validateManifest(manifest: unknown): Manifest {
  // Validate manifest structure
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Invalid manifest: must be an object');
  }

  const manifestObj = manifest as Manifest;

  if (!Array.isArray(manifestObj.components) || manifestObj.components.length === 0) {
    throw new Error('Invalid manifest: components must be a non-empty array');
  }

  for (const component of manifestObj.components) {
    if (!component || typeof component !== 'object') {
      throw new Error('Invalid manifest: each component must be an object');
    }
    if (!component.name || typeof component.name !== 'string') {
      throw new Error('Invalid manifest: each component must have a name (string)');
    }
    if (!component.src || typeof component.src !== 'string') {
      throw new Error('Invalid manifest: each component must have a src (string)');
    }
  }

  return manifestObj;
}
