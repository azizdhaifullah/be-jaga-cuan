import type { Role } from '../../core/types';

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

  async createOtpSession(email: string, code: string, db?: D1Database) {
    const id = crypto.randomUUID();
    const session: OtpSessionRecord = {
      id,
      email,
      code,
      created_at: new Date().toISOString(),
    };
    if (db) {
      await db
        .prepare('INSERT INTO otp_sessions (id, email, code, created_at) VALUES (?1, ?2, ?3, ?4)')
        .bind(session.id, session.email, session.code, session.created_at)
        .run();
      return session;
    }
    this.otpSessions.set(id, session);
    return session;
  }

  async findOtpSession(id: string, db?: D1Database) {
    if (db) {
      const row = await db
        .prepare('SELECT id, email, code, created_at FROM otp_sessions WHERE id = ?1 LIMIT 1')
        .bind(id)
        .first<OtpSessionRecord>();
      return row ?? null;
    }
    return this.otpSessions.get(id) ?? null;
  }

  async consumeOtpSession(id: string, db?: D1Database) {
    if (db) {
      await db.prepare('DELETE FROM otp_sessions WHERE id = ?1').bind(id).run();
      return;
    }
    this.otpSessions.delete(id);
  }

  async findUserByEmail(email: string, db?: D1Database) {
    if (db) {
      const row = await db
        .prepare('SELECT id, email, wallet_id, role FROM users WHERE email = ?1 LIMIT 1')
        .bind(email)
        .first<UserRecord>();
      return row ?? null;
    }
    return this.users.get(email) ?? null;
  }

  async upsertUser(email: string, db?: D1Database) {
    const existing = await this.findUserByEmail(email, db);
    if (existing) {
      return existing;
    }
    const user: UserRecord = {
      id: crypto.randomUUID(),
      email,
      wallet_id: null,
      role: null,
    };
    if (db) {
      await db
        .prepare('INSERT INTO users (id, email, wallet_id, role) VALUES (?1, ?2, NULL, NULL)')
        .bind(user.id, user.email)
        .run();
      return user;
    }
    this.users.set(email, user);
    return user;
  }

  async updateUserWallet(email: string, walletId: string, role: Role, db?: D1Database) {
    const user = await this.upsertUser(email, db);
    const updated = { ...user, wallet_id: walletId, role };
    if (db) {
      await db
        .prepare('UPDATE users SET wallet_id = ?1, role = ?2 WHERE email = ?3')
        .bind(walletId, role, email)
        .run();
      return updated;
    }
    this.users.set(email, updated);
    return updated;
  }
}

export const authRepository = new AuthRepository();
