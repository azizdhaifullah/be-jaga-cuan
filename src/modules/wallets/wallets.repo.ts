import type { Role } from '../../core/types';
import { query } from '../../core/db';

export type WalletMember = {
  user_id: string;
  role: Role;
};

export type WalletRecord = {
  id: string;
  budget_cycle_start_day: number;
  budget_cycle_end_day: number;
  members: WalletMember[];
};

type InviteRecord = {
  code: string;
  wallet_id: string;
  created_by: string;
  expires_at: number;
};

class WalletRepository {
  private readonly wallets = new Map<string, WalletRecord>();
  private readonly invites = new Map<string, InviteRecord>();
  private readonly userWallet = new Map<string, string>();

  async getWalletByUser(userId: string, databaseUrl?: string) {
    if (databaseUrl) {
      const walletRows = await query<Omit<WalletRecord, 'members'>>(
        databaseUrl,
        'SELECT w.id, w.budget_cycle_start_day, w.budget_cycle_end_day FROM wallets w JOIN wallet_members m ON m.wallet_id = w.id WHERE m.user_id = ?1 LIMIT 1',
        [userId],
      );
      const wallet = walletRows[0];
      if (!wallet) {
        return null;
      }
      const membersRows = await query<WalletMember>(
        databaseUrl,
        'SELECT user_id, role FROM wallet_members WHERE wallet_id = ?1',
        [wallet.id],
      );
      return {
        ...wallet,
        members: membersRows,
      } as WalletRecord;
    }
    const walletId = this.userWallet.get(userId);
    if (!walletId) {
      return null;
    }
    return this.wallets.get(walletId) ?? null;
  }

  async ensureWalletForUser(userId: string, role: Role, databaseUrl?: string) {
    const existing = await this.getWalletByUser(userId, databaseUrl);
    if (existing) {
      return existing;
    }
    const wallet: WalletRecord = {
      id: crypto.randomUUID(),
      budget_cycle_start_day: 25,
      budget_cycle_end_day: 24,
      members: [{ user_id: userId, role }],
    };
    if (databaseUrl) {
      await query(
        databaseUrl,
        'INSERT INTO wallets (id, budget_cycle_start_day, budget_cycle_end_day) VALUES (?1, ?2, ?3)',
        [wallet.id, wallet.budget_cycle_start_day, wallet.budget_cycle_end_day],
      );
      await query(databaseUrl, 'INSERT INTO wallet_members (wallet_id, user_id, role) VALUES (?1, ?2, ?3)', [
        wallet.id,
        userId,
        role,
      ]);
      return wallet;
    }
    this.wallets.set(wallet.id, wallet);
    this.userWallet.set(userId, wallet.id);
    return wallet;
  }

  async createInvite(userId: string, walletId: string, databaseUrl?: string) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const invite: InviteRecord = {
      code,
      wallet_id: walletId,
      created_by: userId,
      expires_at: Date.now() + 15 * 60 * 1000,
    };
    if (databaseUrl) {
      await query(databaseUrl, 'INSERT INTO invites (code, wallet_id, created_by, expires_at) VALUES (?1, ?2, ?3, ?4)', [
        invite.code,
        invite.wallet_id,
        invite.created_by,
        invite.expires_at,
      ]);
      return invite;
    }
    this.invites.set(code, invite);
    return invite;
  }

  async findInvite(code: string, databaseUrl?: string) {
    if (databaseUrl) {
      const rows = await query<InviteRecord>(
        databaseUrl,
        'SELECT code, wallet_id, created_by, expires_at FROM invites WHERE code = ?1 LIMIT 1',
        [code],
      );
      return rows[0] ?? null;
    }
    return this.invites.get(code) ?? null;
  }

  async consumeInvite(code: string, databaseUrl?: string) {
    if (databaseUrl) {
      await query(databaseUrl, 'DELETE FROM invites WHERE code = ?1', [code]);
      return;
    }
    this.invites.delete(code);
  }

  async linkUserToWallet(userId: string, walletId: string, role: Role, databaseUrl?: string) {
    if (databaseUrl) {
      const walletRows = await query<Omit<WalletRecord, 'members'>>(
        databaseUrl,
        'SELECT id, budget_cycle_start_day, budget_cycle_end_day FROM wallets WHERE id = ?1 LIMIT 1',
        [walletId],
      );
      const wallet = walletRows[0];
      if (!wallet) {
        return null;
      }
      await query(databaseUrl, 'INSERT INTO wallet_members (wallet_id, user_id, role) VALUES (?1, ?2, ?3) ON CONFLICT (wallet_id, user_id) DO UPDATE SET role = EXCLUDED.role', [walletId, userId, role]);
      const membersRows = await query<WalletMember>(
        databaseUrl,
        'SELECT user_id, role FROM wallet_members WHERE wallet_id = ?1',
        [walletId],
      );
      return {
        ...wallet,
        members: membersRows,
      } as WalletRecord;
    }
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      return null;
    }
    const updated: WalletRecord = {
      ...wallet,
      members: [...wallet.members.filter((m) => m.user_id !== userId), { user_id: userId, role }],
    };
    this.wallets.set(walletId, updated);
    this.userWallet.set(userId, walletId);
    return updated;
  }
}

export const walletRepository = new WalletRepository();
