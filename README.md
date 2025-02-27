
# hakit

## Pre-requisites

1. Bun
2. Neon DB database url - https://console.neon.tech/, add to packages/server/.env

To install dependencies:

```bash
bun install && cd ./packages/client && bun install
```

To run locally:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


## Drizzle DB

.env - DATABASE_URL=GET FROM NEON DB

1. Generate sql files from schemas `bun drizzle-kit generate`
2. Migrate the data to the neon db table `bun run migrate.ts`
3. Visualize the database - `bunx drizzle-kit studio`

When adding new columns, run through all the steps again.

## Authentication
We're using Kinde for authentication, environment variables needed from hakit.kinde.com/admin are:

```bash
KINDE_DOMAIN=
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_REDIRECT_URI=
KINDE_LOGOUT_REDIRECT_URI=
```
