import { describe, expect, it } from 'vitest';

import app from '../src/index';

describe('GET /api/v1/health', () => {
  it('returns success envelope', async () => {
    const response = await app.request('/api/v1/health');
    const body = (await response.json()) as { data: { status: string } };

    expect(response.status).toBe(200);
    expect(body.data.status).toBe('ok');
  });
});
