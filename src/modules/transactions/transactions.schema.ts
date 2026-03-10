import { ApiError } from '../../core/errors';

type CreateTransactionInput = {
  wallet_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_by: 'husband' | 'wife';
  timestamp: string;
};

export const parseCreateTransaction = (body: unknown): CreateTransactionInput => {
  const candidate = body as Partial<CreateTransactionInput>;
  const valid =
    !!candidate.wallet_id &&
    typeof candidate.amount === 'number' &&
    !!candidate.category &&
    !!candidate.timestamp &&
    ['income', 'expense'].includes(candidate.type ?? '') &&
    ['husband', 'wife'].includes(candidate.created_by ?? '');
  if (!valid) {
    throw new ApiError('TX_VALIDATION_FAILED', 400, 'Payload transaksi tidak valid.');
  }
  return candidate as CreateTransactionInput;
};

export const parseWalletId = (walletId: string | undefined) => {
  if (!walletId) {
    throw new ApiError('TX_VALIDATION_FAILED', 400, 'wallet_id wajib diisi.');
  }
  return walletId;
};
