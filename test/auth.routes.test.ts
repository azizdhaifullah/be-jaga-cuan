import { describe, expect, it } from 'vitest';

import app from '../src/index';

describe('Auth routes', () => {
  it('handles otp request and verify', async () => {
    const otpRequest = await app.request('/api/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const otpBody = (await otpRequest.json()) as { data: { otp_session_id: string } };
    expect(otpRequest.status).toBe(201);

    const verify = await app.request('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ otp_session_id: otpBody.data.otp_session_id, otp_code: '123456' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const verifyBody = (await verify.json()) as {
      data: { access_token: string; refresh_token: string; wallet_link_status: string };
    };

    expect(verify.status).toBe(200);
    expect(verifyBody.data.access_token).toContain('access-');
    expect(verifyBody.data.wallet_link_status).toBe('unlinked');
  });

  it('rejects invalid otp', async () => {
    const response = await app.request('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ otp_session_id: 'missing', otp_code: '000000' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('AUTH_INVALID_OTP');
  });

  it('refreshes token', async () => {
    const response = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: 'refresh-demo' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = (await response.json()) as { data: { access_token: string } };
    expect(response.status).toBe(200);
    expect(body.data.access_token).toContain('access-demo');
  });
});
