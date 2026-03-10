import type { TransactionType } from '../../core/types';

export type TransactionRecord = {
  id: string;
  wallet_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  created_by: 'husband' | 'wife';
  timestamp: string;
};

class TransactionsRepository {
  private readonly transactions: TransactionRecord[] = [];

  async listByWallet(walletId: string, db?: D1Database) {
    if (db) {
      const rows = await db
        .prepare(
          'SELECT id, wallet_id, amount, type, category, created_by, timestamp FROM transactions WHERE wallet_id = ?1 ORDER BY timestamp DESC',
        )
        .bind(walletId)
        .all<TransactionRecord>();
      return rows.results;
    }
    return this.transactions
      .filter((tx) => tx.wallet_id === walletId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async create(payload: Omit<TransactionRecord, 'id'>, db?: D1Database) {
    const record: TransactionRecord = {
      id: crypto.randomUUID(),
      ...payload,
    };
    if (db) {
      await db
        .prepare(
          'INSERT INTO transactions (id, wallet_id, amount, type, category, created_by, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
        )
        .bind(
          record.id,
          record.wallet_id,
          record.amount,
          record.type,
          record.category,
          record.created_by,
          record.timestamp,
        )
        .run();
      return record;
    }
    this.transactions.push(record);
    return record;
  }
}

export const transactionsRepository = new TransactionsRepository();
