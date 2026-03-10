import { Hono } from 'hono';

import { ApiError } from '../../core/errors';
import { created, ok } from '../../core/response';
import { authMiddleware } from '../../middleware/auth.middleware';
import { parseCreateDebt, parsePayDebt } from './debts.schema';
import { debtsService } from './debts.service';

export const debtsRoutes = new Hono();

debtsRoutes.use('*', authMiddleware);

debtsRoutes.get('/', async (c) => {
  const walletId = c.req.query('wallet_id');
  if (!walletId) {
    throw new ApiError('DEBT_VALIDATION_FAILED', 400, 'wallet_id wajib diisi.');
  }
  return ok(c, await debtsService.list(walletId, c.env));
});

debtsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  return created(c, await debtsService.create(parseCreateDebt(body), c.env));
});

debtsRoutes.post('/:id/pay', async (c) => {
  const body = await c.req.json();
  const input = parsePayDebt(body);
  const debtId = c.req.param('id');
  return ok(c, await debtsService.payInstallment(debtId, input.amount, c.env));
});
