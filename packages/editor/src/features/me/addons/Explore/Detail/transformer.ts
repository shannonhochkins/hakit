type UrlNode = { tagName?: string } | null | undefined;

type GitHubUrlParts = {
  owner: string; // "GumGum-Inc"
  repo: string; // "ad-library" (no .git)
  ref: string; // branch or SHA, e.g. "main" or "a1b2c3..."
  readmeDir?: string; // directory containing the README, e.g. "", "docs/", "packages/foo/"
  host?: string; // default "github.com" (or your GHE host)
  rawHost?: string; // default "raw.githubusercontent.com" (override for GHE if needed)
};

export function createGitHubUrlTransform({ owner, repo, ref, readmeDir = '', host = 'github.com', rawHost }: GitHubUrlParts) {
  // Default raw host. For GHE you can pass rawHost explicitly.
  const resolvedRawHost = rawHost ?? (host.endsWith('github.com') ? 'raw.githubusercontent.com' : host);

  // Normalise dir -> "foo/bar/" or "" (never leading slash)
  const normDir = normaliseDir(readmeDir);

  // Always end with "/" so URL() resolves relative paths correctly.
  const blobBase = `https://${host}/${owner}/${stripGit(repo)}/blob/${ref}/${normDir}`;
  const rawBase = `https://${resolvedRawHost}/${owner}/${stripGit(repo)}/${ref}/${normDir}`;

  return function urlTransform(url?: string, _key?: string, node?: UrlNode) {
    if (!url) return '';

    // Absolute schemes (http, https, mailto, tel, data, etc) → passthrough
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
    // Protocol-relative //host/path → passthrough
    if (url.startsWith('//')) return url;
    // Pure hash or query → passthrough
    if (url.startsWith('#') || url.startsWith('?')) return url;

    // Choose base: <img> should use raw; others (links) use blob
    const tag = (node?.tagName || '').toLowerCase();
    const base = tag === 'img' ? rawBase : blobBase;

    // Normalise weirdness in relative links: remove leading "/" or "./", convert "\" → "/"
    // (Keep "../" intact so URL() can resolve parent dirs properly)
    const cleaned = stripRepoRootish(url).replace(/\\/g, '/');

    try {
      return new URL(cleaned, base).toString();
    } catch {
      // If something is truly malformed, fall back to original
      return url;
    }
  };
}

// --- helpers ---

function stripGit(name: string) {
  return name.replace(/\.git$/i, '');
}

/** Ensure directory has no leading slash and ends with "/" if non-empty */
function normaliseDir(dir: string) {
  if (!dir) return '';
  const noLead = dir.replace(/^\/+/, '');
  const withFwd = noLead.replace(/\\/g, '/');
  return withFwd.endsWith('/') ? withFwd : withFwd + '/';
}

/** Remove any leading "/" or "./" sequences, but keep "../" (for parent traversal) */
function stripRepoRootish(p: string) {
  return p.replace(/^(?:\/+|\.(?=\/))+/, '');
}
