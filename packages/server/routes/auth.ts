import { Hono } from 'hono';
import { kindeClient, sessionManager } from '../kinde';
import { getUser } from '../kinde';
import { describeRoute } from 'hono-openapi';

const authRoute = new Hono()
  .get(
    '/login',
    describeRoute({ description: 'Login redirect', tags: ['Auth'], responses: { 302: { description: 'Redirect' } } }),
    async c => {
      const loginUrl = await kindeClient.login(sessionManager(c));
      return c.redirect(loginUrl.toString());
    }
  )
  .get(
    '/register',
    describeRoute({ description: 'Register redirect', tags: ['Auth'], responses: { 302: { description: 'Redirect' } } }),
    async c => {
      const registerUrl = await kindeClient.register(sessionManager(c));
      return c.redirect(registerUrl.toString());
    }
  )
  .get(
    '/callback',
    describeRoute({ description: 'Auth callback', tags: ['Auth'], responses: { 302: { description: 'Redirect' } } }),
    async c => {
      // get called every time we login or register
      const url = new URL(c.req.url);
      await kindeClient.handleRedirectToApp(sessionManager(c), url);
      return c.redirect('/');
    }
  )
  .get(
    '/logout',
    describeRoute({ description: 'Logout redirect', tags: ['Auth'], responses: { 302: { description: 'Redirect' } } }),
    async c => {
      const logoutUrl = await kindeClient.logout(sessionManager(c));
      return c.redirect(logoutUrl.toString());
    }
  )
  .get(
    '/me',
    describeRoute({ description: 'Current user', tags: ['Auth'], responses: { 200: { description: 'OK' } } }),
    getUser,
    async c => {
      const user = c.var.user;
      return c.json({ user }, 200);
    }
  );

export default authRoute;
