import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';
import { swaggerUI } from '@hono/swagger-ui';

/**
 * Sets up OpenAPI documentation routes for development environment only
 * @param app - The main Hono app instance to generate specs from
 * @returns A new Hono app with OpenAPI routes, or undefined if in production
 */
export function setupOpenAPI(app: Hono) {
  // Only include OpenAPI documentation in development
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }

  const openApiApp = new Hono();

  // OpenAPI specification endpoint
  openApiApp
    .get(
      '/openapi',
      openAPISpecs(app, {
        documentation: {
          openapi: '3.1.0',
          info: {
            title: 'HAKIT API',
            version: '1.0.0',
            description: 'A powerful drag-and-drop dashboard builder for Home Assistant',
          },
          servers: [
            {
              url: 'http://localhost:3000',
              description: 'Development Server (via Frontend Proxy)',
            },
          ],
          components: {
            securitySchemes: {
              kindeAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'access_token',
                description: 'Kinde authentication via session cookies. Login through the main application first.',
              },
            },
          },
          security: [{ kindeAuth: [] }],
        },
      })
    )
    // Swagger UI for interactive API documentation
    .get(
      '/docs',
      swaggerUI({
        url: '/api/openapi',
        withCredentials: true,
      })
    );

  return openApiApp;
}
