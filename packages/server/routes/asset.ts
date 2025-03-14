import { Hono} from 'hono';
import { getUser } from "../kinde";
import { formatErrorResponse } from "../helpers/formatErrorResponse";
import { gCloudPrefix } from '../helpers/gcloud-file';
import { join } from 'node:path';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { bucket } from '../helpers/gcloud-file';

const signedUrlCache = new Map<
  string,
  { url: string; expiresAt: number }
>();

async function getSignedUrlWithCache(objectKey: string): Promise<string> {
  const now = Date.now();

  // If there's a cached URL and it hasn't expired, reuse it
  const cached = signedUrlCache.get(objectKey);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  // Otherwise, generate a new one that is valid for 1 hour
  const [signedUrl] = await bucket.file(objectKey).getSignedUrl({
    action: 'read',
    expires: now + 60 * 60 * 1000, // 1 hour from now
  });

  // Cache it, so subsequent calls within the hour can reuse
  signedUrlCache.set(objectKey, {
    url: signedUrl,
    expiresAt: now + 60 * 60 * 1000,
  });

  return signedUrl;
}


const assetRoute = new Hono()
  .get('/:objectKey{.*}', getUser, zValidator("param", z.object({
    objectKey: z.string(),
  })), async (c) => {
    try {
      const user = c.var.user;
      const prefix = gCloudPrefix(user.id);
      const fullObjectKey = join(prefix, c.req.valid('param').objectKey);
      const signedUrl = await getSignedUrlWithCache(fullObjectKey);
      return c.redirect(signedUrl, 302);
    } catch (error) {
      return c.json(formatErrorResponse('Read Asset Error', error), 400);
    }
  });


export default assetRoute;
