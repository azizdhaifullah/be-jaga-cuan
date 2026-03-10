import { describe, expect, it } from 'vitest';

import app from '../src/index';

describe('Debts routes', () => {
  it('creates and pays debt installment', async () => {
    const createResponse = await app.request('/api/v1/debts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-owner',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_id: 'wallet-a',
        title: 'Kredit Motor',
        total_amount: 10000000,
        remaining_amount: 4000000,
        due_date: new Date().toISOString(),
        is_shared: true,
      }),
    });
    const createBody = (await createResponse.json()) as { data: { id: string; remaining_amount: number } };

    expect(createResponse.status).toBe(201);

    const payResponse = await app.request(`/api/v1/debts/${createBody.data.id}/pay`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-owner',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 500000 }),
    });
    const payBody = (await payResponse.json()) as { data: { remaining_amount: number } };

    expect(payResponse.status).toBe(200);
    expect(payBody.data.remaining_amount).toBe(3500000);
  });

  it('returns not found for missing debt', async () => {
    const response = await app.request('/api/v1/debts/missing/pay', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-owner',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 500000 }),
    });
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('DEBT_NOT_FOUND');
  });
});
