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
  list(walletId: string, env?: { DATABASE_URL?: string }) {
    return debtsRepository.listByWallet(walletId, env?.DATABASE_URL);
  }

  create(params: CreateDebtParams, env?: { DATABASE_URL?: string }) {
    return debtsRepository.create(params, env?.DATABASE_URL);
  }

  async payInstallment(id: string, amount: number, env?: { DATABASE_URL?: string }) {
    const debt = await debtsRepository.findById(id, env?.DATABASE_URL);
    if (!debt) {
      throw new ApiError('DEBT_NOT_FOUND', 404, 'Data utang tidak ditemukan.');
    }
    const remaining = Math.max(0, debt.remaining_amount - amount);
    return debtsRepository.update(
      {
        ...debt,
        remaining_amount: remaining,
      },
      env?.DATABASE_URL,
    );
  }
}

export const debtsService = new DebtsService();
