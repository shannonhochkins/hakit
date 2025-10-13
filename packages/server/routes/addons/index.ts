import { Hono } from 'hono';
import addonsRoute from './addons';
import userAddonsRoute from './user-addons';
import searchRoute from './search-addons';
import installFromGithubRoute from './install-from-github';

const addonsRoutes = new Hono()
  .route('/addons', addonsRoute)
  .route('/user-addons', userAddonsRoute)
  .route('/search', searchRoute)
  .route('/install', installFromGithubRoute);

export default addonsRoutes;
