import type { Role } from '../../core/types';
import { query } from '../../core/db';

export type UserRecord = {
  id: string;
  email: string;
  wallet_id: string | null;
  role: Role | null;
};

export type OtpSessionRecord = {
  id: string;
  email: string;
  code: string;
  created_at: string;
};

class AuthRepository {
  private readonly users = new Map<string, UserRecord>();
  private readonly otpSessions = new Map<string, OtpSessionRecord>();

  async createOtpSession(email: string, code: string, databaseUrl?: string) {
    const id = crypto.randomUUID();
    const session: OtpSessionRecord = {
      id,
      email,
      code,
      created_at: new Date().toISOString(),
    };
    if (databaseUrl) {
      await query(databaseUrl, 'INSERT INTO otp_sessions (id, email, code, created_at) VALUES (?1, ?2, ?3, ?4)', [
        session.id,
        session.email,
        session.code,
        session.created_at,
      ]);
      return session;
    }
    this.otpSessions.set(id, session);
    return session;
  }

  async findOtpSession(id: string, databaseUrl?: string) {
    if (databaseUrl) {
      const rows = await query<OtpSessionRecord>(
        databaseUrl,
        'SELECT id, email, code, created_at FROM otp_sessions WHERE id = ?1 LIMIT 1',
        [id],
      );
      return rows[0] ?? null;
    }
    return this.otpSessions.get(id) ?? null;
  }

  async consumeOtpSession(id: string, databaseUrl?: string) {
    if (databaseUrl) {
      await query(databaseUrl, 'DELETE FROM otp_sessions WHERE id = ?1', [id]);
      return;
    }
    this.otpSessions.delete(id);
  }

  async findUserByEmail(email: string, databaseUrl?: string) {
    if (databaseUrl) {
      const rows = await query<UserRecord>(
        databaseUrl,
        'SELECT id, email, wallet_id, role FROM users WHERE email = ?1 LIMIT 1',
        [email],
      );
      return rows[0] ?? null;
    }
    return this.users.get(email) ?? null;
  }

  async upsertUser(email: string, databaseUrl?: string) {
    const existing = await this.findUserByEmail(email, databaseUrl);
    if (existing) {
      return existing;
    }
    const user: UserRecord = {
      id: crypto.randomUUID(),
      email,
      wallet_id: null,
      role: null,
    };
    if (databaseUrl) {
      await query(databaseUrl, 'INSERT INTO users (id, email, wallet_id, role) VALUES (?1, ?2, NULL, NULL)', [
        user.id,
        user.email,
      ]);
      return user;
    }
    this.users.set(email, user);
    return user;
  }

  async updateUserWallet(email: string, walletId: string, role: Role, databaseUrl?: string) {
    const user = await this.upsertUser(email, databaseUrl);
    const updated = { ...user, wallet_id: walletId, role };
    if (databaseUrl) {
      await query(databaseUrl, 'UPDATE users SET wallet_id = ?1, role = ?2 WHERE email = ?3', [
        walletId,
        role,
        email,
      ]);
      return updated;
    }
    this.users.set(email, updated);
    return updated;
  }
}

export const authRepository = new AuthRepository();
