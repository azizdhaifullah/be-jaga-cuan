# Jaga Cuan Backend

Cloudflare Workers backend using Hono.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local secrets file from template:

```bash
copy .dev.vars.example .dev.vars
```

3. Run dev server:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

## Environments

- `dev`: default in `wrangler.toml`
- `staging`: `wrangler dev --env staging`
- `production`: `wrangler dev --env production`

`APP_ENV` is exposed to the app and returned from `/api/v1/health` for quick verification.
