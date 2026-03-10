import { ApiError } from '../../core/errors';
import { getOtpCode } from '../../core/env';
import { authRepository } from './auth.repo';

type VerifyOtpResult = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    wallet_id: string | null;
    role: 'husband' | 'wife' | null;
  };
  wallet_link_status: 'linked' | 'unlinked';
};

class AuthService {
  async requestOtp(email: string, env?: { OTP_FIXED_CODE?: string; DB?: D1Database }) {
    const session = await authRepository.createOtpSession(email, getOtpCode(env), env?.DB);
    const masked = `${email[0]}***@${email.split('@')[1]}`;
    return {
      otp_session_id: session.id,
      masked,
    };
  }

  async verifyOtp(
    otpSessionId: string,
    otpCode: string,
    env?: { DB?: D1Database },
  ): Promise<VerifyOtpResult> {
    const session = await authRepository.findOtpSession(otpSessionId, env?.DB);
    if (!session || session.code !== otpCode) {
      throw new ApiError('AUTH_INVALID_OTP', 401, 'Kode OTP salah atau kadaluarsa.');
    }
    await authRepository.consumeOtpSession(otpSessionId, env?.DB);
    const user = await authRepository.upsertUser(session.email, env?.DB);
    return {
      access_token: `access-${user.id}`,
      refresh_token: `refresh-${user.id}`,
      user,
      wallet_link_status: user.wallet_id == null ? 'unlinked' : 'linked',
    };
  }

  refresh(refreshToken: string) {
    if (!refreshToken.startsWith('refresh-')) {
      throw new ApiError('AUTH_TOKEN_EXPIRED', 401, 'Refresh token tidak valid.');
    }
    const suffix = refreshToken.replace('refresh-', '');
    return {
      access_token: `access-${suffix}-${Date.now()}`,
      refresh_token: `refresh-${suffix}-${Date.now()}`,
    };
  }
}

export const authService = new AuthService();
