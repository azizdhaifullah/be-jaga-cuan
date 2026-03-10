export type DebtRecord = {
  id: string;
  wallet_id: string;
  title: string;
  total_amount: number;
  remaining_amount: number;
  due_date: string;
  is_shared: boolean;
};

class DebtsRepository {
  private readonly debts: DebtRecord[] = [];

  async listByWallet(walletId: string, db?: D1Database) {
    if (db) {
      const rows = await db
        .prepare(
          'SELECT id, wallet_id, title, total_amount, remaining_amount, due_date, is_shared FROM debts WHERE wallet_id = ?1',
        )
        .bind(walletId)
        .all<DebtRecord>();
      return rows.results.map((item) => ({
        ...item,
        is_shared: Boolean(item.is_shared),
      }));
    }
    return this.debts.filter((debt) => debt.wallet_id === walletId);
  }

  async create(payload: Omit<DebtRecord, 'id'>, db?: D1Database) {
    const record: DebtRecord = {
      id: crypto.randomUUID(),
      ...payload,
    };
    if (db) {
      await db
        .prepare(
          'INSERT INTO debts (id, wallet_id, title, total_amount, remaining_amount, due_date, is_shared) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
        )
        .bind(
          record.id,
          record.wallet_id,
          record.title,
          record.total_amount,
          record.remaining_amount,
          record.due_date,
          record.is_shared ? 1 : 0,
        )
        .run();
      return record;
    }
    this.debts.push(record);
    return record;
  }

  async findById(id: string, db?: D1Database) {
    if (db) {
      const row = await db
        .prepare(
          'SELECT id, wallet_id, title, total_amount, remaining_amount, due_date, is_shared FROM debts WHERE id = ?1 LIMIT 1',
        )
        .bind(id)
        .first<DebtRecord>();
      if (!row) {
        return null;
      }
      return {
        ...row,
        is_shared: Boolean(row.is_shared),
      };
    }
    return this.debts.find((debt) => debt.id === id) ?? null;
  }

  async update(debt: DebtRecord, db?: D1Database) {
    if (db) {
      await db
        .prepare(
          'UPDATE debts SET wallet_id = ?1, title = ?2, total_amount = ?3, remaining_amount = ?4, due_date = ?5, is_shared = ?6 WHERE id = ?7',
        )
        .bind(
          debt.wallet_id,
          debt.title,
          debt.total_amount,
          debt.remaining_amount,
          debt.due_date,
          debt.is_shared ? 1 : 0,
          debt.id,
        )
        .run();
      return debt;
    }
    const index = this.debts.findIndex((item) => item.id === debt.id);
    if (index >= 0) {
      this.debts[index] = debt;
    }
    return debt;
  }
}

export const debtsRepository = new DebtsRepository();
