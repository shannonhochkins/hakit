import JSZip from 'jszip';
import z from 'zod/v4';

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
  publicPath: z.string(),
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

// Constants
const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB limit for zip files

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
        const errorMessages = result.error.message;
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
