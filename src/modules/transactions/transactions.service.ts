import { transactionsRepository } from './transactions.repo';

type CreateTransactionParams = {
  wallet_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_by: 'husband' | 'wife';
  timestamp: string;
};

class TransactionsService {
  list(walletId: string, env?: { DATABASE_URL?: string }) {
    return transactionsRepository.listByWallet(walletId, env?.DATABASE_URL);
  }

  create(params: CreateTransactionParams, env?: { DATABASE_URL?: string }) {
    return transactionsRepository.create(params, env?.DATABASE_URL);
  }
}

export const transactionsService = new TransactionsService();
