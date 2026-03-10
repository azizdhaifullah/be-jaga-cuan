import { ApiError } from '../../core/errors';
import type { Role } from '../../core/types';
import { authRepository } from '../auth/auth.repo';
import { walletRepository } from './wallets.repo';

class WalletsService {
  async createInvite(userId: string, env?: { DB?: D1Database }) {
    const wallet = await walletRepository.ensureWalletForUser(userId, 'husband', env?.DB);
    const invite = await walletRepository.createInvite(userId, wallet.id, env?.DB);
    return {
      invite_code: invite.code,
      expires_at: new Date(invite.expires_at).toISOString(),
    };
  }

  async linkWallet(userId: string, inviteCode: string, role: Role, env?: { DB?: D1Database }) {
    const invite = await walletRepository.findInvite(inviteCode, env?.DB);
    if (!invite || invite.expires_at < Date.now()) {
      throw new ApiError('WALLET_INVITE_INVALID', 400, 'Kode undangan tidak valid.');
    }

    const wallet = await walletRepository.linkUserToWallet(userId, invite.wallet_id, role, env?.DB);
    if (!wallet) {
      throw new ApiError('WALLET_INVITE_INVALID', 400, 'Wallet undangan tidak ditemukan.');
    }

    const roleSet = new Set(wallet.members.map((member) => member.role));
    if (roleSet.size != wallet.members.length) {
      throw new ApiError('WALLET_ROLE_CONFLICT', 409, 'Role sudah digunakan pasangan.');
    }
    await authRepository.updateUserWallet(`${userId}@example.com`, wallet.id, role, env?.DB);
    await walletRepository.consumeInvite(inviteCode, env?.DB);
    return wallet;
  }

  async getWalletProfile(userId: string, env?: { DB?: D1Database }) {
    const wallet = await walletRepository.getWalletByUser(userId, env?.DB);
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
