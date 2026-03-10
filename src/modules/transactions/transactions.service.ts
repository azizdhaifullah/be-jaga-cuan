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
  list(walletId: string, env?: { DB?: D1Database }) {
    return transactionsRepository.listByWallet(walletId, env?.DB);
  }

  create(params: CreateTransactionParams, env?: { DB?: D1Database }) {
    return transactionsRepository.create(params, env?.DB);
  }
}

export const transactionsService = new TransactionsService();
