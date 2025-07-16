import { createClient } from '@supabase/supabase-js';
import { join } from 'node:path';
import JSZip from 'jszip';
import { z } from 'zod';

// Constants
const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB limit for zip files

// Module Federation manifest schema
const mfAssetSchema = z.object({
  js: z.object({
    sync: z.array(z.string()),
    async: z.array(z.string()),
  }),
  css: z.object({
    sync: z.array(z.string()),
    async: z.array(z.string()),
  }),
});

const mfExposeSchema = z.object({
  id: z.string(),
  name: z.string(),
  assets: mfAssetSchema,
  path: z.string(),
});

const mfRemoteEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.string(),
});

const mfTypesSchema = z.object({
  path: z.string(),
  name: z.string(),
  zip: z.string(),
  api: z.string(),
});

const mfBuildInfoSchema = z.object({
  buildVersion: z.string(),
  buildName: z.string(),
});

const mfMetaDataSchema = z.object({
  name: z.string(),
  type: z.string(),
  buildInfo: mfBuildInfoSchema,
  remoteEntry: mfRemoteEntrySchema,
  types: mfTypesSchema,
  globalName: z.string(),
  pluginVersion: z.string(),
  prefetchInterface: z.boolean(),
  getPublicPath: z.string(),
});

const mfManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  metaData: mfMetaDataSchema,
  shared: z.array(z.unknown()), // Can be array of shared dependencies
  remotes: z.array(z.unknown()), // Can be array of remote modules
  exposes: z.array(mfExposeSchema),
});

// Infer the TypeScript type from the schema
export type MfManifest = z.infer<typeof mfManifestSchema>;

// Create Supabase client
const supabase = createClient(process.env.SUPABASE_PROJECT_URL!, process.env.SUPABASE_ANON_KEY!);

function dashboardContentPrefix(userId: string, filename: string) {
  return join('dashboard-content', userId, filename);
}

function getPublicUrl(suffix: string): string {
  const prefix = process.env.SUPABASE_BUCKET_PUBLIC_PREFIX!;
  const publicUrl = join(prefix, suffix);
  return publicUrl;
}

// Upload file using standard upload
async function uploadFile(file: File, filePath: string) {
  try {
    const { data, error } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).upload(filePath, file);
    if (error) {
      // Handle error
      throw new Error(error.message);
    } else {
      return data;
    }
  } catch (e) {
    console.error('Error uploading file:', e);
    throw e;
  }
}

export async function deleteFile(userId: string, filePath: string) {
  try {
    const filePathSuffix = filePath.split(`/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME!}/`).pop();
    if (!filePathSuffix) {
      throw new Error('Invalid file path');
    }
    if (!filePathSuffix.includes(userId)) {
      throw new Error('File does not belong to user');
    }
    const asset = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).info(filePathSuffix);
    if (!asset.data) {
      throw new Error('File not found');
    }
    const { error } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).remove([asset.data.name]);
    if (error) {
      // Handle error
      throw new Error(error.message);
    } else {
      return { success: true };
    }
  } catch (e) {
    console.error('Error deleting file:', e);
    throw e;
  }
}

export async function uploadImage(userId: string, file: File) {
  // get the current file name extension
  const fileName = file.name.split('.');
  const fileExtension = fileName[fileName.length - 1];
  const filename = Date.now() + '.' + fileExtension;
  const filePath = `images/${filename}`;
  const response = await uploadFile(file, dashboardContentPrefix(userId, filePath));
  return getPublicUrl(response.fullPath);
}

function repositoryContentPrefix(repositoryId: string, version: string, filename: string) {
  return join('repositories', repositoryId, version, filename);
}

// Upload repository file (for manifests, zips, etc.)
export async function uploadRepositoryFile(
  repositoryId: string,
  version: string,
  file: File | ArrayBuffer,
  filename: string,
  mimeType?: string
) {
  try {
    const filePath = repositoryContentPrefix(repositoryId, version, filename);

    let fileToUpload: File;
    if (file instanceof ArrayBuffer) {
      fileToUpload = new File([file], filename, { type: mimeType || 'application/octet-stream' });
    } else {
      fileToUpload = file;
    }

    const { data, error } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).upload(filePath, fileToUpload);

    if (error) {
      throw new Error(error.message);
    }

    return {
      data,
      publicUrl: getPublicUrl(data.fullPath),
    };
  } catch (e) {
    console.error('Error uploading repository file:', e);
    throw e;
  }
}

// Delete repository files
export async function deleteRepositoryFiles(repositoryId: string, version: string) {
  try {
    const prefix = repositoryContentPrefix(repositoryId, version, '');

    // List all files in the repository version folder
    const { data, error } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).list(prefix);

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      const filePaths = data.map(file => join(prefix, file.name));

      const { error: deleteError } = await supabase.storage.from(process.env.SUPABASE_BUCKET_NAME!).remove(filePaths);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    return { success: true };
  } catch (e) {
    console.error('Error deleting repository files:', e);
    throw e;
  }
}

// Comprehensive zip validation with metadata extraction
export interface ZipValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: {
    mfManifest?: MfManifest;
    componentNames?: string[];
    fileCount?: number;
    hasManifest?: boolean;
    hasFederationFiles?: boolean;
  };
}

// Validate zip contents from a buffer (used for GitHub downloads)
export async function validateRepositoryZipFromBuffer(zipBuffer: Buffer): Promise<ZipValidationResult> {
  try {
    // Check buffer size
    if (zipBuffer.length > MAX_ZIP_SIZE) {
      return {
        isValid: false,
        error: `Zip file too large. Maximum size is ${MAX_ZIP_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Parse the zip file from buffer
    const zip = await JSZip.loadAsync(zipBuffer);

    // Check for mf-manifest.json
    const manifestFile = zip.file('mf-manifest.json');
    if (!manifestFile) {
      return {
        isValid: false,
        error: 'Missing mf-manifest.json file in the zip',
      };
    }

    // Parse manifest
    let mfManifest: MfManifest;
    try {
      const manifestContent = await manifestFile.async('text');
      const parsedManifest = JSON.parse(manifestContent);

      // Use Zod to validate and parse the manifest
      const result = mfManifestSchema.safeParse(parsedManifest);
      if (!result.success) {
        const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return {
          isValid: false,
          error: `Invalid mf-manifest.json structure: ${errorMessages}`,
        };
      }

      mfManifest = result.data;
    } catch (parseError) {
      return {
        isValid: false,
        error: `Invalid mf-manifest.json format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
      };
    }

    // Check for federation files
    const federationFiles = Object.keys(zip.files).filter(filename => filename.endsWith('.js') || filename.endsWith('.css'));

    // Basic security validation - check for dangerous files
    const dangerousExtensions = ['.exe', '.bat', '.sh', '.ps1', '.cmd', '.scr', '.vbs'];
    const suspiciousFiles = Object.keys(zip.files).filter(filename => {
      const lower = filename.toLowerCase();
      return dangerousExtensions.some(ext => lower.endsWith(ext)) || filename.includes('..') || filename.startsWith('/');
    });

    if (suspiciousFiles.length > 0) {
      return {
        isValid: false,
        error: `Potentially dangerous files detected: ${suspiciousFiles.join(', ')}`,
      };
    }

    // Extract component names from manifest
    const componentNames = mfManifest.exposes.map((expose: { name: string }) => expose.name);

    return {
      isValid: true,
      metadata: {
        mfManifest,
        componentNames,
        fileCount: Object.keys(zip.files).length,
        hasManifest: true,
        hasFederationFiles: federationFiles.length > 0,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse zip file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
