import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and } from 'drizzle-orm';
import { userRepositoriesTable, repositoriesTable, repositoryVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../../kinde';
import { streamSSE } from 'hono/streaming';
import * as https from 'https';
import { validateRepositoryZipFromBuffer } from '../../helpers/upload';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

const githubInstallSchema = z.object({
  repositoryUrl: z
    .string()
    .url('Must be a valid URL')
    .refine(url => url.includes('github.com'), 'Must be a GitHub repository URL'),
});

const installFromGithubRoute = new Hono().post('/from-github', getUser, zValidator('json', githubInstallSchema), async c => {
  const { repositoryUrl } = await c.req.valid('json');
  const user = c.var.user;

  return streamSSE(c, async stream => {
    try {
      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Starting GitHub repository installation...',
          status: 'success',
        }),
      });

      // Parse GitHub URL to extract owner and repo
      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Parsing repository URL...',
          status: 'success',
        }),
      });

      const githubUrlMatch = repositoryUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
      if (!githubUrlMatch) {
        throw new Error('Invalid GitHub repository URL format');
      }

      const [, owner, repoName] = githubUrlMatch;
      const cleanRepoName = repoName.replace(/\.git$/, '');

      await stream.writeSSE({
        data: JSON.stringify({
          message: `Found repository: ${owner}/${cleanRepoName}`,
          status: 'success',
        }),
      });

      // Fetch package.json from main branch
      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Fetching package.json from main branch...',
          status: 'success',
        }),
      });

      let packageJsonContent = '';

      try {
        const packageJsonUrl = `https://raw.githubusercontent.com/${owner}/${cleanRepoName}/main/package.json`;
        packageJsonContent = await fetchFromUrl(packageJsonUrl);
      } catch (e) {
        throw new Error(`Failed to fetch package.json: ${(e as Error).message}`);
      }

      let packageJson;
      try {
        packageJson = JSON.parse(packageJsonContent);
      } catch {
        throw new Error('Invalid package.json format');
      }

      if (!packageJson.version) {
        throw new Error('package.json must contain a version field');
      }

      const version = packageJson.version;
      const repositoryName = packageJson.name || cleanRepoName;
      const description = packageJson.description || null;
      const author = packageJson.author || owner;

      await stream.writeSSE({
        data: JSON.stringify({
          message: `Found version ${version} for ${repositoryName}`,
          status: 'success',
        }),
      });

      // Check if this repository/version already exists in our database
      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Checking if repository exists in database...',
          status: 'success',
        }),
      });

      const existingRepo = await db.select().from(repositoriesTable).where(eq(repositoriesTable.githubUrl, repositoryUrl)).limit(1);

      let repository;
      let repositoryVersion;

      if (existingRepo.length > 0) {
        repository = existingRepo[0];

        // Check if this specific version exists
        const existingVersion = await db
          .select()
          .from(repositoryVersionsTable)
          .where(and(eq(repositoryVersionsTable.repositoryId, repository.id), eq(repositoryVersionsTable.version, version)))
          .limit(1);

        if (existingVersion.length > 0) {
          repositoryVersion = existingVersion[0];

          await stream.writeSSE({
            data: JSON.stringify({
              message: 'Repository version already exists, installing existing version...',
              status: 'success',
            }),
          });

          // Check if user already has this installed
          const existingUserRepo = await db
            .select()
            .from(userRepositoriesTable)
            .where(and(eq(userRepositoriesTable.userId, user.id), eq(userRepositoriesTable.repositoryId, repository.id)))
            .limit(1);

          if (existingUserRepo.length > 0) {
            // Update to this version if different
            if (existingUserRepo[0].versionId !== repositoryVersion.id) {
              await db
                .update(userRepositoriesTable)
                .set({
                  versionId: repositoryVersion.id,
                  lastUsedAt: new Date(),
                })
                .where(eq(userRepositoriesTable.id, existingUserRepo[0].id));

              await stream.writeSSE({
                data: JSON.stringify({
                  message: 'Updated to latest version!',
                  status: 'success',
                }),
              });
            } else {
              await stream.writeSSE({
                data: JSON.stringify({
                  message: 'Repository already installed with this version!',
                  status: 'warning',
                }),
              });
            }
          } else {
            // Install for user
            await db.insert(userRepositoriesTable).values({
              id: uuidv4(),
              userId: user.id,
              repositoryId: repository.id,
              versionId: repositoryVersion.id,
              connectedAt: new Date(),
              lastUsedAt: null,
            });

            await stream.writeSSE({
              data: JSON.stringify({
                message: 'Repository installed successfully!',
                status: 'success',
              }),
            });
          }
          return;
        }
      }

      // Need to download and process the zip file
      await stream.writeSSE({
        data: JSON.stringify({
          message: `Downloading zip from versions/v${version}.zip...`,
          status: 'success',
        }),
      });

      let zipBuffer: Buffer;

      try {
        // Try to download the zip file from versions directory
        const zipUrl = `https://github.com/${owner}/${cleanRepoName}/raw/main/versions/v${version}.zip`;
        zipBuffer = await downloadFile(zipUrl);
      } catch (e) {
        throw new Error(`Failed to download zip file: ${(e as Error).message}`);
      }

      if (zipBuffer.length > MAX_FILE_SIZE) {
        throw new Error(
          `File size (${Math.round(zipBuffer.length / 1024 / 1024)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
      }

      await stream.writeSSE({
        data: JSON.stringify({
          message: `Downloaded ${Math.round(zipBuffer.length / 1024)}KB, validating contents...`,
          status: 'success',
        }),
      });

      // Validate zip contents using JSZip
      const validation = await validateRepositoryZipFromBuffer(zipBuffer);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid zip file');
      }

      // Extract metadata from validation
      const componentNames = validation.metadata?.componentNames || [];

      await stream.writeSSE({
        data: JSON.stringify({
          message: `Found ${componentNames.length} components: ${componentNames.join(', ')}`,
          status: 'success',
        }),
      });

      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Zip validation passed, processing repository...',
          status: 'success',
        }),
      });

      // Create repository if it doesn't exist
      if (!repository) {
        await stream.writeSSE({
          data: JSON.stringify({
            message: 'Creating new repository record...',
            status: 'success',
          }),
        });

        const [newRepo] = await db
          .insert(repositoriesTable)
          .values({
            id: uuidv4(),
            name: repositoryName,
            description,
            author: typeof author === 'string' ? author : author?.name || owner,
            githubUrl: repositoryUrl,
            deprecated: false,
            isPublic: true,
            totalDownloads: 0,
            latestVersion: version,
            lastUpdated: new Date(),
          })
          .returning();

        repository = newRepo;
      }

      // Create version record
      await stream.writeSSE({
        data: JSON.stringify({
          message: `Validating semver format for version ${version}...`,
          status: 'success',
        }),
      });

      // Validate version format before database insert
      const semverRegex = /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
      if (!semverRegex.test(version)) {
        throw new Error(`Invalid version format: ${version}. Must follow semantic versioning (e.g., 1.0.0, 1.0.0-alpha.1)`);
      }

      await stream.writeSSE({
        data: JSON.stringify({
          message: `Creating new version record for ${version}...`,
          status: 'success',
        }),
      });

      const [newVersion] = await db
        .insert(repositoryVersionsTable)
        .values({
          id: uuidv4(),
          repositoryId: repository.id,
          version,
          components: componentNames.map(name => ({ name })),
          manifestUrl: '', // TODO: Upload manifest and set URL
          releaseNotes: null,
          isPrerelease: false,
          downloadCount: 0,
        })
        .returning();

      // Update the repository's latestVersion if this is a newer version
      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Updating repository latest version...',
          status: 'success',
        }),
      });

      // Simple version comparison - in production, you'd use proper semver comparison
      const shouldUpdateLatest =
        !repository.latestVersion || version.localeCompare(repository.latestVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;

      if (shouldUpdateLatest) {
        await db
          .update(repositoriesTable)
          .set({
            latestVersion: version,
            lastUpdated: new Date(),
          })
          .where(eq(repositoriesTable.id, repository.id));
      }

      // Install for user
      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Installing repository for user...',
          status: 'success',
        }),
      });

      await db.insert(userRepositoriesTable).values({
        id: uuidv4(),
        userId: user.id,
        repositoryId: repository.id,
        versionId: newVersion.id,
        connectedAt: new Date(),
        lastUsedAt: null,
      });

      // TODO: Process the zip file and upload to your storage solution
      // This is where you'd extract the zip, read the manifest,
      // upload files to Supabase/S3, and update the manifest URL

      await stream.writeSSE({
        data: JSON.stringify({
          message: 'Repository installed successfully!',
          status: 'success',
          data: {
            repository: {
              id: repository.id,
              name: repository.name,
              version,
              componentNames,
              componentCount: componentNames.length,
            },
            owner,
            repoName: cleanRepoName,
          },
        }),
      });
    } catch (error) {
      console.error('GitHub installation error:', error);
      await stream.writeSSE({
        data: JSON.stringify({
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          status: 'error',
        }),
      });
    }
  });
});

// Helper function to fetch text content from URL
async function fetchFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      })
      .on('error', error => {
        reject(error);
      });
  });
}

// Helper function to download binary file
async function downloadFile(url: string, maxRedirects: number = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(url, response => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
          if (maxRedirects <= 0) {
            reject(new Error(`Too many redirects for ${url}`));
            return;
          }

          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            reject(new Error(`Redirect without location header for ${url}`));
            return;
          }

          // Follow the redirect
          downloadFile(redirectUrl, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', chunk => {
          chunks.push(chunk);
        });

        response.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      })
      .on('error', error => {
        reject(error);
      });
  });
}

export default installFromGithubRoute;
