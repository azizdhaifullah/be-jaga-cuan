import type { Context, Next } from 'hono';

import { ApiError } from '../core/errors';

export type AuthContext = {
  user_id: string;
  email: string;
};

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('AUTH_UNAUTHORIZED', 401, 'Token tidak ditemukan.');
  }
  const token = authHeader.replace('Bearer ', '');
  if (!token.startsWith('access-')) {
    throw new ApiError('AUTH_TOKEN_EXPIRED', 401, 'Token tidak valid.');
  }
  const userId = token.replace('access-', '').split('-')[0];
  c.set('auth', {
    user_id: userId,
    email: `${userId}@example.com`,
  } satisfies AuthContext);
  await next();
};
