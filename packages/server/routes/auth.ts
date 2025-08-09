import { Hono } from 'hono';
import { kindeClient, sessionManager } from '../kinde';
import { getUser } from '../kinde';
import { describeRoute } from 'hono-openapi';

const authRoute = new Hono()
  .get(
    '/login',
    describeRoute({
      summary: 'Initiate login',
      description: 'Redirect to Kinde login page',
      responses: {
        302: {
          description: 'Redirect to Kinde login page',
        },
      },
      tags: ['Authentication'],
    }),
    async c => {
      const loginUrl = await kindeClient.login(sessionManager(c));
      return c.redirect(loginUrl.toString());
    }
  )
  .get(
    '/register',
    describeRoute({
      summary: 'Initiate registration',
      description: 'Redirect to Kinde registration page',
      responses: {
        302: {
          description: 'Redirect to Kinde registration page',
        },
      },
      tags: ['Authentication'],
    }),
    async c => {
      const registerUrl = await kindeClient.register(sessionManager(c));
      return c.redirect(registerUrl.toString());
    }
  )
  .get(
    '/callback',
    describeRoute({
      summary: 'Authentication callback',
      description: 'Handle authentication callback from Kinde',
      responses: {
        302: {
          description: 'Redirect to application after successful authentication',
        },
      },
      tags: ['Authentication'],
    }),
    async c => {
      // get called every time we login or register
      const url = new URL(c.req.url);
      await kindeClient.handleRedirectToApp(sessionManager(c), url);
      return c.redirect('/');
    }
  )
  .get(
    '/logout',
    describeRoute({
      summary: 'Initiate logout',
      description: 'Redirect to Kinde logout page',
      responses: {
        302: {
          description: 'Redirect to Kinde logout page',
        },
      },
      tags: ['Authentication'],
    }),
    async c => {
      const logoutUrl = await kindeClient.logout(sessionManager(c));
      return c.redirect(logoutUrl.toString());
    }
  )
  .get(
    '/me',
    describeRoute({
      summary: 'Get current user',
      description: 'Get the currently authenticated user information',
      responses: {
        200: {
          description: 'User information retrieved successfully',
        },
        401: {
          description: 'User not authenticated',
        },
      },
      tags: ['Authentication'],
    }),
    getUser,
    async c => {
      const user = c.var.user;
      return c.json({ user }, 200);
    }
  );

export default authRoute;
