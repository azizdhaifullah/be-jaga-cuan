import type { Context } from 'hono';

export type ApiMeta = {
  cursor?: string;
  next_cursor?: string;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorShape = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export const ok = <T>(c: Context, data: T, meta?: ApiMeta) => {
  return c.json<ApiSuccess<T>>({ data, meta }, 200);
};

export const created = <T>(c: Context, data: T) => {
  return c.json<ApiSuccess<T>>({ data }, 201);
};

export const fail = (
  c: Context,
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) => {
  return c.json<ApiErrorShape>({ error: { code, message, details } }, status);
};
