type AppBindings = {
  APP_ENV?: string;
  JWT_SECRET?: string;
  OTP_FIXED_CODE?: string;
  DATABASE_URL?: string;
};

export const getAppEnv = (env: AppBindings | undefined) => env?.APP_ENV ?? 'dev';

export const getJwtSecret = (env: AppBindings | undefined) => env?.JWT_SECRET ?? 'dev-secret';

export const getOtpCode = (env: AppBindings | undefined) => env?.OTP_FIXED_CODE ?? '123456';

export const getDatabaseUrl = (env: AppBindings | undefined) => env?.DATABASE_URL;
