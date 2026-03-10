import { Hono } from 'hono';

import { created, ok } from '../../core/response';
import { parseOtpRequest, parseOtpVerify, parseRefresh } from './auth.schema';
import { authService } from './auth.service';

export const authRoutes = new Hono();

authRoutes.post('/otp/request', async (c) => {
  const body = await c.req.json();
  const input = parseOtpRequest(body);
  return created(c, await authService.requestOtp(input.email, c.env));
});

authRoutes.post('/otp/verify', async (c) => {
  const body = await c.req.json();
  const input = parseOtpVerify(body);
  return ok(c, await authService.verifyOtp(input.otp_session_id, input.otp_code, c.env));
});

authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json();
  const input = parseRefresh(body);
  return ok(c, authService.refresh(input.refresh_token));
});
