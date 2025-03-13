import { Storage, type SaveData } from '@google-cloud/storage';
import { type BunFile } from 'bun';


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
/**
 * 
 * @param prefix 
 * @example await listFileVersions('dashboard-content/{userId}/components')
 * @returns 
 */
export async function listFileVersions(prefix: string) {
  const [files] = await bucket.getFiles({ prefix });
  // Map over files to extract useful information including generation which is unique for each version.
  const fileVersions = files.map(file => ({
    name: file.name,
    updated: file.metadata.updated,
    size: file.metadata.size,
  }));
  return fileVersions;
}

export async function uploadFile({
  saveData,
  suffix,
  userId,
  contentType,
}: {
  saveData: SaveData,
  suffix: string,
  userId?: string,
  contentType: string,
}) {
  
  try {
    if (!userId) {
      throw new Error('User not found');
    }
    const destinationPath = `dashboard-content/${userId}/${suffix}`;

    const gcFile = bucket.file(destinationPath);
    // Upload using the .save() convenience method
    await gcFile.save(saveData, {
      metadata: {
        contentType, // MIME type from the File object
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
    // Create a file object in GCS:
    // const arrayBuffer = await file.arrayBuffer()
    // const buffer = Buffer.from(arrayBuffer);
    const code = await file.text();
    const objectKey = await uploadFile({
      saveData: code,
      suffix: performance.now().toString(),
      userId,
      contentType: file.type,
    });
    return objectKey;

  } catch (e) {
    console.log('error', e);
  }
}
