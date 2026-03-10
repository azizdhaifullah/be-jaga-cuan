import { Hono } from 'hono';

import { ApiError } from '../../core/errors';
import { created, ok } from '../../core/response';
import type { Role } from '../../core/types';
import { authMiddleware, type AuthContext } from '../../middleware/auth.middleware';
import { walletsService } from './wallets.service';

export const walletsRoutes = new Hono();

walletsRoutes.use('*', authMiddleware);

walletsRoutes.post('/invite', async (c) => {
  const auth = c.get('auth') as AuthContext;
  return created(c, await walletsService.createInvite(auth.user_id, c.env));
});

walletsRoutes.post('/link', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json<{ invite_code?: string; role?: Role }>();
  if (!body.invite_code || !body.role || !['husband', 'wife'].includes(body.role)) {
    throw new ApiError('WALLET_INVITE_INVALID', 400, 'Data link wallet tidak valid.');
  }
  return ok(c, await walletsService.linkWallet(auth.user_id, body.invite_code, body.role, c.env));
});

walletsRoutes.get('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  return ok(c, await walletsService.getWalletProfile(auth.user_id, c.env));
});
