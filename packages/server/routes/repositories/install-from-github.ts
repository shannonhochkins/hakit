import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and } from 'drizzle-orm';
import { userRepositoriesTable, repositoriesTable, repositoryVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../../kinde';
import { streamSSE, type SSEStreamingApi } from 'hono/streaming';
import * as https from 'https';
import { validateRepositoryZipFromBuffer } from './validate-zip';
import { uploadRepositoryZipContents } from '../../helpers/upload';
import { Octokit } from '@octokit/rest';
import type { PackageJson } from 'type-fest';
import { describeRoute } from 'hono-openapi';

// Create Octokit instance (no auth needed for public repos)
const octokit = new Octokit();

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

type SSEStatus = 'success' | 'warning' | 'error';

interface SSEMessage {
  message: string;
  status: SSEStatus;
  data?: Record<string, unknown>;
}

// Generic helper function for writing SSE messages
async function writeSSEMessage(stream: SSEStreamingApi, { message, status, data }: SSEMessage): Promise<void> {
  await stream.writeSSE({
    data: JSON.stringify({
      message,
      status,
      ...(data && { data }),
    }),
  });
}

const githubInstallSchema = z.object({
  repositoryUrl: z
    .string()
    .url('Must be a valid URL')
    .refine(url => url.includes('github.com'), 'Must be a GitHub repository URL'),
});

const installFromGithubRoute = new Hono().post(
  '/from-github',
  describeRoute({
    summary: 'Install repository from GitHub',
    description: 'Install a repository directly from a GitHub URL with real-time progress updates via Server-Sent Events',
    responses: {
      200: {
        description: 'Repository installation progress (Server-Sent Events)',
      },
      400: {
        description: 'Installation error or validation failed',
      },
    },
    tags: ['Repository Install'],
  }),
  getUser,
  zValidator('json', githubInstallSchema),
  async c => {
    const { repositoryUrl } = await c.req.valid('json');
    const user = c.var.user;

    return streamSSE(c, async stream => {
      try {
        await writeSSEMessage(stream, {
          message: 'Starting GitHub repository installation...',
          status: 'success',
        });

        // Parse GitHub URL to extract owner and repo
        await writeSSEMessage(stream, {
          message: 'Parsing repository URL...',
          status: 'success',
        });

        const githubUrlMatch = repositoryUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
        if (!githubUrlMatch) {
          throw new Error('Invalid GitHub repository URL format');
        }

        const [, owner, repoName] = githubUrlMatch;
        const cleanRepoName = repoName.replace(/\.git$/, '');

        await writeSSEMessage(stream, {
          message: `Found repository: ${owner}/${cleanRepoName}`,
          status: 'success',
        });

        // Get the default branch for this repository
        await writeSSEMessage(stream, {
          message: 'Detecting default branch...',
          status: 'success',
        });

        const repoInfo = await getDefaultBranch(owner, cleanRepoName);
        const { defaultBranch, isPrivate } = repoInfo;

        // Check if repository is private
        if (isPrivate) {
          throw new Error(`Repository ${owner}/${cleanRepoName} is private and cannot be installed`);
        }

        await writeSSEMessage(stream, {
          message: `Using branch: ${defaultBranch}`,
          status: 'success',
        });

        // Fetch package.json from default branch
        await writeSSEMessage(stream, {
          message: `Fetching package.json from ${defaultBranch} branch...`,
          status: 'success',
        });

        let packageJsonContent = '';

        try {
          const packageJsonUrl = `https://raw.githubusercontent.com/${owner}/${cleanRepoName}/${defaultBranch}/package.json`;
          packageJsonContent = await fetchFromUrl(packageJsonUrl);
        } catch (e) {
          throw new Error(`Failed to fetch package.json from ${defaultBranch} branch: ${(e as Error).message}`);
        }

        let packageJson;
        try {
          packageJson = JSON.parse(packageJsonContent) as PackageJson;
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

        await writeSSEMessage(stream, {
          message: `Found version ${version} for ${repositoryName}`,
          status: 'success',
        });

        // Check if this repository/version already exists in our database
        await writeSSEMessage(stream, {
          message: 'Checking if repository exists in database...',
          status: 'success',
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

            await writeSSEMessage(stream, {
              message: 'Repository version already exists, checking user installation...',
              status: 'success',
            });

            // Check if user already has this repository installed
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

                await writeSSEMessage(stream, {
                  message: 'Updated current user version to latest version!',
                  status: 'success',
                });
              } else {
                await writeSSEMessage(stream, {
                  message: `Repository already installed with this version (${version})!`,
                  status: 'warning',
                });
              }
            } else {
              // Install for user - repository and version exist, but user doesn't have it
              await db.insert(userRepositoriesTable).values({
                id: uuidv4(),
                userId: user.id,
                repositoryId: repository.id,
                versionId: repositoryVersion.id,
                connectedAt: new Date(),
                lastUsedAt: null,
              });

              // Increment download counts
              await db
                .update(repositoriesTable)
                .set({ totalDownloads: repository.totalDownloads + 1 })
                .where(eq(repositoriesTable.id, repository.id));

              await db
                .update(repositoryVersionsTable)
                .set({ downloadCount: repositoryVersion.downloadCount + 1 })
                .where(eq(repositoryVersionsTable.id, repositoryVersion.id));

              await writeSSEMessage(stream, {
                message: 'Repository installed successfully!',
                status: 'success',
              });
            }
            return;
          }
        }

        // Need to download and process the zip file
        await writeSSEMessage(stream, {
          message: `Downloading zip from versions/v${version}.zip...`,
          status: 'success',
        });

        let zipBuffer: Buffer;

        try {
          // Try to download the zip file from versions directory using default branch
          const zipUrl = `https://github.com/${owner}/${cleanRepoName}/raw/${defaultBranch}/versions/v${version}.zip`;
          zipBuffer = await downloadFile(zipUrl);
        } catch (e) {
          const error = e as Error;

          // Provide more specific error messages based on common scenarios
          if (error.message.includes('404')) {
            throw new Error(
              `Repository is missing v${version}.zip file in the versions/ directory. Please ensure the zip file exists at: versions/v${version}.zip`
            );
          } else if (error.message.includes('403')) {
            throw new Error(
              `Access denied when downloading v${version}.zip. The repository may be private or the file permissions are restricted.`
            );
          } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
            throw new Error(`GitHub server error when downloading v${version}.zip. Please try again later.`);
          } else if (error.message.includes('timeout') || error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND')) {
            throw new Error(`Network error when downloading v${version}.zip. Please check your connection and try again.`);
          } else {
            throw new Error(`Failed to download v${version}.zip: ${error.message}`);
          }
        }

        if (zipBuffer.length > MAX_FILE_SIZE) {
          throw new Error(
            `File size (${Math.round(zipBuffer.length / 1024 / 1024)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
          );
        }

        await writeSSEMessage(stream, {
          message: `Downloaded ${Math.round(zipBuffer.length / 1024)}KB, validating contents...`,
          status: 'success',
        });

        // Validate zip contents using JSZip
        const validation = await validateRepositoryZipFromBuffer(zipBuffer);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid zip file');
        }

        // Extract metadata from validation
        const componentNames = validation.metadata?.componentNames || [];

        await writeSSEMessage(stream, {
          message: `Found ${componentNames.length} components: ${componentNames.join(', ')}`,
          status: 'success',
        });

        await writeSSEMessage(stream, {
          message: 'Zip validation passed, processing repository...',
          status: 'success',
        });

        // Create repository if it doesn't exist
        if (!repository) {
          await writeSSEMessage(stream, {
            message: 'Creating new repository record...',
            status: 'success',
          });

          const [newRepo] = await db
            .insert(repositoriesTable)
            .values({
              id: uuidv4(),
              name: repositoryName,
              description,
              author: typeof author === 'string' ? author : author?.name || owner,
              githubUrl: repositoryUrl,
              isPublic: true,
              totalDownloads: 0, // Start with 0, will be incremented when user connects
              latestVersion: version,
              lastUpdated: new Date(),
            })
            .returning();

          repository = newRepo;
        }

        // Create version record
        await writeSSEMessage(stream, {
          message: `Validating semver format for version ${version}...`,
          status: 'success',
        });

        // Validate version format before database insert
        const semverRegex = /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
        if (!semverRegex.test(version)) {
          throw new Error(`Invalid version format: ${version}. Must follow semantic versioning (e.g., 1.0.0, 1.0.0-alpha.1)`);
        }

        await writeSSEMessage(stream, {
          message: `Version ${version} is valid, uploading assets...`,
          status: 'success',
        });

        // Upload all files from the zip to Supabase storage
        const uploadResult = await uploadRepositoryZipContents(repository.id, version, zipBuffer, stream, writeSSEMessage);

        await writeSSEMessage(stream, {
          message: `Uploaded ${uploadResult.uploadedFiles.length} files to storage`,
          status: 'success',
        });

        if (!uploadResult.manifestUrl) {
          throw new Error('No manifest file (mf-manifest.json) found in uploaded files');
        }

        await writeSSEMessage(stream, {
          message: `Creating new version record for ${version}...`,
          status: 'success',
        });

        // Find release notes URL
        const releaseNotesUrl = await findReleaseNotesUrl(owner, cleanRepoName, version, defaultBranch);

        if (releaseNotesUrl) {
          await writeSSEMessage(stream, {
            message: `Found release notes: ${releaseNotesUrl}`,
            status: 'success',
          });
        }

        const [newVersion] = await db
          .insert(repositoryVersionsTable)
          .values({
            id: uuidv4(),
            repositoryId: repository.id,
            version,
            components: componentNames.map(name => ({ name })),
            manifestUrl: uploadResult.manifestUrl,
            releaseNotesUrl,
            isBeta: false,
            downloadCount: 0, // Start with 0, will be incremented when user connects
          })
          .returning();

        // Update the repository's latestVersion if this is a newer version
        await writeSSEMessage(stream, {
          message: 'Updating repository latest version...',
          status: 'success',
        });

        // Simple version comparison - in production, you'd use proper semver comparison
        const shouldUpdateLatest =
          !repository.latestVersion ||
          version.localeCompare(repository.latestVersion, undefined, { numeric: true, sensitivity: 'base' }) > 0;

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
        await writeSSEMessage(stream, {
          message: 'Installing repository for user...',
          status: 'success',
        });

        // Check if user already has this repository installed (with any version)
        const existingUserRepo = await db
          .select()
          .from(userRepositoriesTable)
          .where(and(eq(userRepositoriesTable.userId, user.id), eq(userRepositoriesTable.repositoryId, repository.id)))
          .limit(1);

        if (existingUserRepo.length > 0) {
          // Update existing connection to new version
          await db
            .update(userRepositoriesTable)
            .set({
              versionId: newVersion.id,
              lastUsedAt: new Date(),
            })
            .where(eq(userRepositoriesTable.id, existingUserRepo[0].id));

          // Increment download counts for the new version
          await db
            .update(repositoriesTable)
            .set({ totalDownloads: repository.totalDownloads + 1 })
            .where(eq(repositoriesTable.id, repository.id));

          await db
            .update(repositoryVersionsTable)
            .set({ downloadCount: newVersion.downloadCount + 1 })
            .where(eq(repositoryVersionsTable.id, newVersion.id));

          await writeSSEMessage(stream, {
            message: 'Updated existing repository to new version!',
            status: 'success',
          });
        } else {
          // Create new connection
          await db.insert(userRepositoriesTable).values({
            id: uuidv4(),
            userId: user.id,
            repositoryId: repository.id,
            versionId: newVersion.id,
            connectedAt: new Date(),
            lastUsedAt: null,
          });

          // Increment download counts for new installation
          await db
            .update(repositoriesTable)
            .set({ totalDownloads: repository.totalDownloads + 1 })
            .where(eq(repositoriesTable.id, repository.id));

          await db
            .update(repositoryVersionsTable)
            .set({ downloadCount: newVersion.downloadCount + 1 })
            .where(eq(repositoryVersionsTable.id, newVersion.id));

          await writeSSEMessage(stream, {
            message: 'Repository connected successfully!',
            status: 'success',
          });
        }

        await writeSSEMessage(stream, {
          message: 'Repository installed successfully!',
          status: 'success',
          data: {
            repository: {
              id: repository.id,
              name: repository.name,
              version,
              componentNames,
              componentCount: componentNames.length,
              manifestUrl: uploadResult.manifestUrl,
            },
            owner,
            repoName: cleanRepoName,
            uploadedFiles: uploadResult.uploadedFiles.length,
          },
        });
      } catch (error) {
        console.error('GitHub installation error:', error);
        await writeSSEMessage(stream, {
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          status: 'error',
        });
      }
    });
  }
);

// Helper function to get the default branch of a repository and check if it's private
async function getDefaultBranch(owner: string, repo: string): Promise<{ defaultBranch: string; isPrivate: boolean }> {
  try {
    const response = await octokit.rest.repos.get({
      owner,
      repo,
    });

    const { default_branch, private: isPrivate } = response.data;

    return {
      defaultBranch: default_branch || 'main',
      isPrivate: Boolean(isPrivate),
    };
  } catch (error) {
    console.warn(`Failed to fetch repository info for ${owner}/${repo}:`, error);

    // If we can't access the repo (likely private or doesn't exist), throw an error
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(`Repository ${owner}/${repo} not found or is private`);
    }

    // For other errors, return defaults with assumption it might be private
    return {
      defaultBranch: 'main',
      isPrivate: true, // Assume private if we can't determine
    };
  }
}

// Helper function to find release notes URL
async function findReleaseNotesUrl(owner: string, repo: string, version: string, defaultBranch: string = 'main'): Promise<string | null> {
  // First, try to find a GitHub release matching the version
  try {
    const response = await octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag: `v${version}`,
    });

    if (response.data.html_url) {
      return response.data.html_url;
    }
  } catch (error) {
    // Log the specific error for debugging
    console.warn(`Failed to fetch GitHub release for ${owner}/${repo}/releases/tags/v${version}:`, error);
    // Continue to check for markdown files
  }

  // If no release found, look for common release notes files
  const releaseNotesFiles = ['RELEASE_NOTES.md', 'CHANGELOG.md', 'RELEASES.md', 'HISTORY.md', 'CHANGES.md'];

  for (const filename of releaseNotesFiles) {
    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filename,
        ref: defaultBranch,
      });
      // If we reach here, the file exists
      return `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${filename}`;
    } catch {
      // File doesn't exist, continue to next
      continue;
    }
  }

  return null;
}

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
          reject(new Error(`HTTP ${response.statusCode}: Failed to download ${url}`));
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
