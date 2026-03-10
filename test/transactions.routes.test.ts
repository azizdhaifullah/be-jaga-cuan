import { describe, expect, it } from 'vitest';

import app from '../src/index';

describe('Transactions routes', () => {
  it('creates and lists transactions', async () => {
    const walletId = 'wallet-test';
    const createResponse = await app.request('/api/v1/transactions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-owner',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_id: walletId,
        amount: 200000,
        type: 'expense',
        category: 'Belanja',
        created_by: 'wife',
        timestamp: new Date().toISOString(),
      }),
    });

    expect(createResponse.status).toBe(201);

    const listResponse = await app.request(`/api/v1/transactions?wallet_id=${walletId}`, {
      headers: {
        Authorization: 'Bearer access-owner',
      },
    });
    const listBody = (await listResponse.json()) as { data: Array<{ wallet_id: string }> };
    expect(listResponse.status).toBe(200);
    expect(listBody.data.length).toBeGreaterThan(0);
    expect(listBody.data[0].wallet_id).toBe(walletId);
  });
});
