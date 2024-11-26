// src/model/Request/BudgetTransaction.ts
export interface CreateBudgetTransactionRequest {
  fromBudget: number;
  toBudget: number;
  eventId: string;
  note?: string;
}

export interface UpdateBudgetTransactionRequest extends CreateBudgetTransactionRequest {}
