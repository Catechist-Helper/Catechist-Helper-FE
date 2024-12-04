// src/model/Response/BudgetTransaction.ts
export interface BudgetTransactionResponseItem {
  id: string;
  fromBudget: number;
  toBudget: number;
  event: {
    id: string;
    name: string;
    description: string;
    isPeriodic: boolean;
    isCheckedIn: boolean;
    address: string;
    startTime: string; // ISO format
    endTime: string; // ISO format
    current_budget: number;
    eventStatus: number;
  };
  transactionImages: 
  {
      id: string,
      budgetTransactionId: string,
      imageUrl: string,
      uploadAt: string
  }[]
}
