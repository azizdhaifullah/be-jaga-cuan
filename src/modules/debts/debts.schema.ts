import { ApiError } from '../../core/errors';

type CreateDebtInput = {
  wallet_id: string;
  title: string;
  total_amount: number;
  remaining_amount: number;
  due_date: string;
  is_shared: boolean;
};

export const parseCreateDebt = (body: unknown): CreateDebtInput => {
  const candidate = body as Partial<CreateDebtInput>;
  const valid =
    !!candidate.wallet_id &&
    !!candidate.title &&
    typeof candidate.total_amount === 'number' &&
    typeof candidate.remaining_amount === 'number' &&
    !!candidate.due_date &&
    typeof candidate.is_shared === 'boolean';
  if (!valid) {
    throw new ApiError('DEBT_VALIDATION_FAILED', 400, 'Payload utang tidak valid.');
  }
  return candidate as CreateDebtInput;
};

export const parsePayDebt = (body: unknown) => {
  const candidate = body as { amount?: number };
  if (typeof candidate.amount !== 'number' || candidate.amount <= 0) {
    throw new ApiError('DEBT_VALIDATION_FAILED', 400, 'Nominal cicilan tidak valid.');
  }
  return { amount: candidate.amount };
};
