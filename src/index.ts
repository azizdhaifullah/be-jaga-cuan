import { Hono } from 'hono';

import { runMigrations } from './core/db';
import { getAppEnv, getDatabaseUrl } from './core/env';
import { ApiError } from './core/errors';
import { fail, ok } from './core/response';
import { authRoutes } from './modules/auth/auth.routes';
import { debtsRoutes } from './modules/debts/debts.routes';
import { transactionsRoutes } from './modules/transactions/transactions.routes';
import { walletsRoutes } from './modules/wallets/wallets.routes';

const app = new Hono();

app.use('*', async (c, next) => {
  const databaseUrl = getDatabaseUrl(c.env);
  if (databaseUrl) {
    await runMigrations(databaseUrl);
  }
  await next();
});

const api = new Hono();

api.get('/health', (c) => ok(c, { status: 'ok', env: getAppEnv(c.env) }));
api.route('/auth', authRoutes);
api.route('/wallets', walletsRoutes);
api.route('/transactions', transactionsRoutes);
api.route('/debts', debtsRoutes);

app.route('/api/v1', api);

app.onError((err, c) => {
  console.error('Unhandled error', err);
  if (err instanceof ApiError) {
    return fail(c, err.code, err.message, err.status, err.details);
  }
  return fail(c, 'INTERNAL_ERROR', 'Terjadi kesalahan server.', 500);
});

export default app;
