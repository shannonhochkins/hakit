
# hakit

## Pre-requisites

1. Bun
2. .env file with DATABASE_URL value, and KINDE env variables listed below
3. service-account.json

To install dependencies:

```bash
bun install && cd ./packages/client && bun install
```

To run locally:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## GCLOUD Postgres
- Need to attach IP address to access the DB, will be the server and any local IP needed


## Subabase DB with Drizzle-kit ORM

.env - DATABASE_URL= GET FROM SUPABASE - Use Session pooler url:

1. Generate sql files from schemas `bun drizzle-kit generate`
2. Migrate the data to the gcp db table `bun run migrate.ts`
3. Visualize the database - `bunx drizzle-kit studio`

When adding new columns, run through all the steps again.

## Authentication
Using Kinde for authentication locally, environment variables needed from hakit.kinde.com/admin are:

```bash
KINDE_DOMAIN=https://hakit.kinde.com
KINDE_CLIENT_ID=<REDACTED>
KINDE_CLIENT_SECRET=<REDACTED
KINDE_REDIRECT_URI=http://localhost:3000/api/callback
KINDE_LOGOUT_REDIRECT_URI=http://localhost:3000
```

#### Kinde redirect urls
May need to update the redirect urls in the application settings within the kinde dashboard if new domains are added. The redirect urls are used to redirect the user back to the application after authentication.