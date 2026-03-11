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

And set Neon connection in `.dev.vars`:

```env
DATABASE_URL=postgresql://admin:<password>@ep-proud-hill-a1zwja9e-pooler.ap-southeast-1.aws.neon.tech/jaga_cuan?sslmode=require&channel_binding=require
JWT_SECRET=replace-with-secure-secret
OTP_FIXED_CODE=123456
```

3. Run dev server:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

## Deploy to Cloudflare

```bash
npx wrangler login
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
npx wrangler secret put OTP_FIXED_CODE
npx wrangler deploy --env production
```

Or use scripts:

```bash
npm run deploy:staging
npm run deploy:prod
```

## Smoke Check

After deploy:

```bash
BASE_URL=https://<your-worker-domain> npm run smoke
```

## Environments

- `dev`: default in `wrangler.toml`
- `staging`: `wrangler dev --env staging`
- `production`: `wrangler dev --env production`

`APP_ENV` is exposed to the app and returned from `/api/v1/health` for quick verification.
