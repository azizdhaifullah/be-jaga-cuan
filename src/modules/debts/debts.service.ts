import { ApiError } from '../../core/errors';
import { debtsRepository } from './debts.repo';

type CreateDebtParams = {
  wallet_id: string;
  title: string;
  total_amount: number;
  remaining_amount: number;
  due_date: string;
  is_shared: boolean;
};

class DebtsService {
  list(walletId: string, env?: { DB?: D1Database }) {
    return debtsRepository.listByWallet(walletId, env?.DB);
  }

  create(params: CreateDebtParams, env?: { DB?: D1Database }) {
    return debtsRepository.create(params, env?.DB);
  }

  async payInstallment(id: string, amount: number, env?: { DB?: D1Database }) {
    const debt = await debtsRepository.findById(id, env?.DB);
    if (!debt) {
      throw new ApiError('DEBT_NOT_FOUND', 404, 'Data utang tidak ditemukan.');
    }
    const remaining = Math.max(0, debt.remaining_amount - amount);
    return debtsRepository.update({
      ...debt,
      remaining_amount: remaining,
    }, env?.DB);
  }
}

export const debtsService = new DebtsService();
