import { queryOptions } from "@tanstack/react-query";
import { api, callApi } from './';


export async function uploadComponent(files: FileList | null) {
  if (!files || files.length === 0) return;
  const [componentFile] = files;
  if (componentFile) {
      // Adjust path if you named it differently in your Hono routes
    return await callApi(api.component.upload.file.$post({
      form: {
        file: componentFile,
      }
    }));
  } else {
    throw new Error('No file provided or too many files provided');
  }
}

export async function uploadGithubRepo(githubUrl: string) {
  if (!githubUrl || githubUrl.length === 0) return;
  // Adjust path if you named it differently in your Hono routes
  return await callApi(api.component.upload.github.$post({
    json: {
      githubUrl
    }
  }));
}

export async function getComponentForUser(componentId: string) {
  return await callApi(api.component[":componentId"].$get({
    param: {
      componentId,
    }
  }));
}


export async function getComponentsForUser() {
  const req = api.component.$get();
  const res = await callApi(req);
  return res; 
}


export const componentQueryOptions = (componentId: string) => queryOptions({
  queryKey: ["get-component-for-user", componentId],
  queryFn: () => getComponentForUser(componentId),
  staleTime: Infinity,
});

export const componentsQueryOptions = queryOptions({
  queryKey: ["get-components-for-user"],
  queryFn: getComponentsForUser,
  staleTime: Infinity,
});