import { ApiError } from '../../core/errors';

type OtpRequestInput = {
  email: string;
};

type OtpVerifyInput = {
  otp_session_id: string;
  otp_code: string;
};

type RefreshInput = {
  refresh_token: string;
};

export const parseOtpRequest = (body: unknown): OtpRequestInput => {
  const candidate = body as Partial<OtpRequestInput>;
  if (!candidate.email || !candidate.email.includes('@')) {
    throw new ApiError('AUTH_INVALID_EMAIL', 400, 'Email tidak valid.');
  }
  return { email: candidate.email.toLowerCase() };
};

export const parseOtpVerify = (body: unknown): OtpVerifyInput => {
  const candidate = body as Partial<OtpVerifyInput>;
  if (!candidate.otp_session_id || !candidate.otp_code) {
    throw new ApiError('AUTH_INVALID_OTP', 400, 'OTP tidak valid.');
  }
  return {
    otp_session_id: candidate.otp_session_id,
    otp_code: candidate.otp_code,
  };
};

export const parseRefresh = (body: unknown): RefreshInput => {
  const candidate = body as Partial<RefreshInput>;
  if (!candidate.refresh_token) {
    throw new ApiError('AUTH_TOKEN_EXPIRED', 401, 'Refresh token tidak valid.');
  }
  return { refresh_token: candidate.refresh_token };
};
