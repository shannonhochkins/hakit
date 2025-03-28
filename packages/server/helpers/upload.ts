import { createClient } from '@supabase/supabase-js';
import { join } from 'node:path';
// Create Supabase client
const supabase = createClient(process.env.SUPABASE_PROJECT_URL!, process.env.SUPABASE_ANON_KEY!);

function dashboardContentPrefix(userId: string, filename: string) {
  return join('dashboard-content', userId, filename);
}

async function getPublicUrl(suffix: string): Promise<string> {
  const prefix = process.env.SUPABASE_BUCKET_PUBLIC_PREFIX!;
  const publicUrl = join(prefix, suffix);
  return publicUrl;
}

// Upload file using standard upload
async function uploadFile(file: File, filePath: string) {
  try {
    console.log('filePath', filePath);
    const { data, error } = await supabase
      .storage
      .from('hakit')
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

export async function uploadImage(userId: string, file: File) {
  // get the current file name extension
  const fileName = file.name.split('.');
  const fileExtension = fileName[fileName.length - 1];
  const filename = Date.now() + '.' + fileExtension;
  const filePath = `images/${filename}`;
  const response = await uploadFile(file, dashboardContentPrefix(userId, filePath));
  return getPublicUrl(response.fullPath);
}