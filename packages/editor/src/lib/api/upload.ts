import { api, callApi } from './';

export async function uploadImage(files: FileList | null) {
  if (!files || files.length === 0) return;
  const componentFile = files[0];
  if (componentFile) {
    // Adjust path if you named it differently in your Hono routes
    return await callApi(api.upload.image.$post({
      form: {
        file: componentFile,
      }
    }));
  } else {
    throw new Error('No file provided or too many files provided');
  }
}


export async function deleteFile(filePath: string) {
  // Adjust path if you named it differently in your Hono routes
  return await callApi(api.upload.image.$delete({
    json: {
      filePath
    }
  }));
}
