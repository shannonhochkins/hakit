import { Storage } from '@google-cloud/storage';
import type { BunFile } from 'bun';


const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEYFILENAME,
});
const bucket = storage.bucket(process.env.BUCKET_NAME!);

export async function getSignedUrl(objectKey: string) {
  const file = bucket.file(objectKey);
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 10, // 10 min
  })
  return signedUrl;
}

export async function uploadFile(file: File | BunFile, userId?: string) {
  
  try {
    if (!userId) {
      throw new Error('User not found');
    }
    const destinationPath = `dashboard-content/${userId}/${performance.now().toString()}`;
    // Create a file object in GCS:
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer);

    const gcFile = bucket.file(destinationPath);
    // Upload using the .save() convenience method
    await gcFile.save(buffer, {
      metadata: {
        contentType: file.type, // MIME type from the File object
      },
      resumable: false, // optional; if you have large files, consider `true`
    })
    return destinationPath;

  } catch (e) {
    console.log('error', e);
  }
}


export async function uploadFileFromPath(path: string, userId?: string) {
  try {
    if (!userId) {
      throw new Error('User not found');
    }
    const file = Bun.file(path);
    const objectKey = await uploadFile(file, userId);
    return objectKey;

  } catch (e) {
    console.log('error', e);
  }
}
