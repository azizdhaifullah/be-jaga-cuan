import { describe, expect, it } from 'vitest';

import app from '../src/index';

describe('Wallet routes', () => {
  it('creates invite and links partner', async () => {
    const inviterToken = 'Bearer access-inviter';
    const inviteResponse = await app.request('/api/v1/wallets/invite', {
      method: 'POST',
      headers: { Authorization: inviterToken },
    });
    const inviteBody = (await inviteResponse.json()) as { data: { invite_code: string } };

    expect(inviteResponse.status).toBe(201);

    const linkResponse = await app.request('/api/v1/wallets/link', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-partner',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invite_code: inviteBody.data.invite_code, role: 'wife' }),
    });

    expect(linkResponse.status).toBe(200);
  });

  it('rejects invalid invite code', async () => {
    const response = await app.request('/api/v1/wallets/link', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-user2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invite_code: 'INVALID', role: 'wife' }),
    });
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('WALLET_INVITE_INVALID');
  });
});
