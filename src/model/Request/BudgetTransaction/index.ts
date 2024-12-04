// src/model/Request/BudgetTransaction.ts
export interface CreateBudgetTransactionRequest {
  fromBudget: number;
  toBudget: number;
  eventId: string;
  note?: string;
  transactionImages: File[]
}

export interface UpdateBudgetTransactionRequest extends CreateBudgetTransactionRequest {}
