import { Hono } from 'hono';
import repositoriesRoute from './repositories';
import userRepositoriesRoute from './user-repositories';
import searchRoute from './search-repositories';
import installFromGithubRoute from './install-from-github';

const repositoriesRoutes = new Hono()
  .route('/repositories', repositoriesRoute)
  .route('/user-repositories', userRepositoriesRoute)
  .route('/search', searchRoute)
  .route('/install', installFromGithubRoute);

export default repositoriesRoutes;
