import { createClient } from '@supabase/supabase-js';
import { join } from 'node:path';
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
    const { data, error } = await supabase
      .storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .upload(filePath, file)
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
    const { error } = await supabase
      .storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .remove([asset.data.name]);
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