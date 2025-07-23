import { createClient } from '@supabase/supabase-js';
import { join } from 'node:path';
import JSZip from 'jszip';
import type { SSEStreamingApi } from 'hono/streaming';

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

// Upload all files from a zip buffer to repository storage
export async function uploadRepositoryZipContents(
  repositoryId: string,
  version: string,
  zipBuffer: Buffer,
  stream?: SSEStreamingApi,
  writeSSEMessage?: (stream: SSEStreamingApi, message: { message: string; status: 'success' | 'warning' | 'error' }) => Promise<void>
): Promise<{ uploadedFiles: Array<{ filename: string; publicUrl: string; path: string }>; manifestUrl: string | null }> {
  try {
    // Parse the zip file
    const zip = await JSZip.loadAsync(zipBuffer);
    const uploadedFiles: Array<{ filename: string; publicUrl: string; path: string }> = [];
    let manifestUrl: string | null = null;

    const files = Object.entries(zip.files).filter(([, zipObject]) => !zipObject.dir);

    if (stream && writeSSEMessage) {
      await writeSSEMessage(stream, {
        message: `Uploading ${files.length} files to storage...`,
        status: 'success',
      });
    }

    // Process each file in the zip
    for (const [index, [filename, zipObject]] of files.entries()) {
      if (stream && writeSSEMessage) {
        await writeSSEMessage(stream, {
          message: `Uploading ${filename} (${index + 1}/${files.length})...`,
          status: 'success',
        });
      }

      // Get file content as buffer
      let fileContent = await zipObject.async('arraybuffer');

      // Determine MIME type based on file extension
      const mimeType = getMimeType(filename);

      // For text-based files, replace the asset prefix placeholder
      if (isTextBasedFile(mimeType)) {
        try {
          // For module federation to work, the remote application needs to have a publicPath of
          // {{{_HAKIT_ASSET_PREFIX_}}}, so that we can dynamically replace it before we upload with the right path
          // to the repository assets so that when the runtime modules load, they can resolve the correct paths
          // Convert to string, replace placeholder, convert back to buffer
          const textContent = new TextDecoder('utf-8').decode(fileContent);
          const repositoryPath = repositoryContentPrefix(repositoryId, version, '');
          const fullPath = join(process.env.SUPABASE_BUCKET_NAME!, repositoryPath);
          const basePath = getPublicUrl(fullPath);
          const updatedContent = textContent.replace(/{{{_HAKIT_ASSET_PREFIX_}}}/g, basePath);
          // save converted content back to buffer, ArrayBufferLike is similar to ArrayBuffer enough for us to cast it here.
          fileContent = new TextEncoder().encode(updatedContent).buffer as ArrayBuffer;
        } catch (error) {
          console.warn(`Failed to process text replacement for ${filename}:`, error);
          // Continue with original content if replacement fails
        }
      }

      // Upload the file
      const uploadResult = await uploadRepositoryFile(repositoryId, version, fileContent, filename, mimeType);

      uploadedFiles.push({
        filename,
        publicUrl: uploadResult.publicUrl,
        path: uploadResult.data.fullPath,
      });

      // Check if this is the manifest file
      if (filename === 'mf-manifest.json') {
        manifestUrl = uploadResult.publicUrl;
      }
    }

    return { uploadedFiles, manifestUrl };
  } catch (e) {
    console.error('Error uploading repository zip contents:', e);
    throw e;
  }
}

// Helper function to determine MIME type based on file extension
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'application/javascript';
    case 'css':
      return 'text/css';
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    case 'svg':
      return 'image/svg+xml';
    case 'ts':
    case 'tsx':
      return 'application/typescript';
    case 'jsx':
      return 'application/javascript';
    case 'md':
      return 'text/markdown';
    case 'txt':
      return 'text/plain';
    case 'xml':
      return 'application/xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    case 'ttf':
      return 'font/ttf';
    case 'eot':
      return 'application/vnd.ms-fontobject';
    default:
      return 'application/octet-stream';
  }
}

// Helper function to determine if file is text-based and could contain placeholders
function isTextBasedFile(mimeType: string): boolean {
  return (
    mimeType.startsWith('text/') ||
    mimeType.startsWith('application/javascript') ||
    mimeType.startsWith('application/json') ||
    mimeType.startsWith('application/xml') ||
    mimeType.startsWith('application/typescript') ||
    mimeType.includes('svg')
  );
}
