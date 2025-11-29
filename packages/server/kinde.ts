import { createKindeServerClient, GrantType, type SessionManager, type UserType } from '@kinde-oss/kinde-typescript-sdk';
import { type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { CookieOptions } from 'hono/utils/cookie';
import { z } from 'zod/v4';

const KindeEnv = z.object({
  KINDE_DOMAIN: z.string(),
  KINDE_CLIENT_ID: z.string(),
  KINDE_CLIENT_SECRET: z.string(),
  KINDE_REDIRECT_URI: z.url(),
  KINDE_LOGOUT_REDIRECT_URI: z.url(),
});

// throws an exception if the environment is missing something vital
const ProcessEnv = KindeEnv.parse(process.env);

// Client for authorization code flow
export const kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
  authDomain: ProcessEnv.KINDE_DOMAIN,
  clientId: ProcessEnv.KINDE_CLIENT_ID,
  clientSecret: ProcessEnv.KINDE_CLIENT_SECRET,
  redirectURL: ProcessEnv.KINDE_REDIRECT_URI,
  logoutRedirectURL: ProcessEnv.KINDE_LOGOUT_REDIRECT_URI,
});

// TODO - Safari locally simply doesn't like the cookie settings below, you need to set secure to false for local development
// and set the path to /, however this causes 504 timeouts for chrome....
// Need to test in production once built

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    const result = getCookie(c, key);
    return result;
  },
  async setSessionItem(key: string, value: unknown) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 365,
    } as const;
    if (typeof value === 'string') {
      setCookie(c, key, value, cookieOptions);
    } else {
      setCookie(c, key, JSON.stringify(value), cookieOptions);
    }
  },
  async removeSessionItem(key: string) {
    deleteCookie(c, key);
  },
  async destroySession() {
    ['id_token', 'access_token', 'user', 'refresh_token'].forEach(key => {
      deleteCookie(c, key);
    });
  },
});

type Env = {
  Variables: {
    user: UserType;
  };
};

export const getUser = createMiddleware<Env>(async (c, next) => {
  try {
    const manager = sessionManager(c);
    const isAuthenticated = await kindeClient.isAuthenticated(manager);
    if (!isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const user = await kindeClient.getUserProfile(manager);
    c.set('user', user);
    await next();
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});
