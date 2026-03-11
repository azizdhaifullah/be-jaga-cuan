import { ApiError } from '../../core/errors';
import type { Role } from '../../core/types';
import { authRepository } from '../auth/auth.repo';
import { walletRepository } from './wallets.repo';

class WalletsService {
  async createInvite(userId: string, env?: { DATABASE_URL?: string }) {
    const wallet = await walletRepository.ensureWalletForUser(userId, 'husband', env?.DATABASE_URL);
    const invite = await walletRepository.createInvite(userId, wallet.id, env?.DATABASE_URL);
    return {
      invite_code: invite.code,
      expires_at: new Date(invite.expires_at).toISOString(),
    };
  }

  async linkWallet(userId: string, inviteCode: string, role: Role, env?: { DATABASE_URL?: string }) {
    const invite = await walletRepository.findInvite(inviteCode, env?.DATABASE_URL);
    if (!invite || invite.expires_at < Date.now()) {
      throw new ApiError('WALLET_INVITE_INVALID', 400, 'Kode undangan tidak valid.');
    }

    const wallet = await walletRepository.linkUserToWallet(
      userId,
      invite.wallet_id,
      role,
      env?.DATABASE_URL,
    );
    if (!wallet) {
      throw new ApiError('WALLET_INVITE_INVALID', 400, 'Wallet undangan tidak ditemukan.');
    }

    const roleSet = new Set(wallet.members.map((member) => member.role));
    if (roleSet.size != wallet.members.length) {
      throw new ApiError('WALLET_ROLE_CONFLICT', 409, 'Role sudah digunakan pasangan.');
    }
    await authRepository.updateUserWallet(`${userId}@example.com`, wallet.id, role, env?.DATABASE_URL);
    await walletRepository.consumeInvite(inviteCode, env?.DATABASE_URL);
    return wallet;
  }

  async getWalletProfile(userId: string, env?: { DATABASE_URL?: string }) {
    const wallet = await walletRepository.getWalletByUser(userId, env?.DATABASE_URL);
    if (!wallet) {
      return {
        linked: false,
      };
    }
    return {
      linked: true,
      wallet,
    };
  }
}

export const walletsService = new WalletsService();
