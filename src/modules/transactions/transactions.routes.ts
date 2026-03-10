import { Hono } from 'hono';

import { created, ok } from '../../core/response';
import { authMiddleware } from '../../middleware/auth.middleware';
import { parseCreateTransaction, parseWalletId } from './transactions.schema';
import { transactionsService } from './transactions.service';

export const transactionsRoutes = new Hono();

transactionsRoutes.use('*', authMiddleware);

transactionsRoutes.get('/', async (c) => {
  const walletId = parseWalletId(c.req.query('wallet_id'));
  return ok(c, await transactionsService.list(walletId, c.env));
});

transactionsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const input = parseCreateTransaction(body);
  return created(c, await transactionsService.create(input, c.env));
});
