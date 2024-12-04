// src/api/BudgetTransaction/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import {
    CreateBudgetTransactionRequest,
    UpdateBudgetTransactionRequest,
  } from "../../model/Request/BudgetTransaction";
import {
  BudgetTransactionResponseItem,
} from "../../model/Response/BudgetTransaction";

const request = axiosInstances.base;
const ROOT_BUDGET_TRANSACTION = "/budget-transactions";

// GET: Lấy thông tin chi tiết của một budget transaction
const getBudgetTransactionById = (id: string) => {
  return request.get<BasicResponse<BudgetTransactionResponseItem>>(
    `${ROOT_BUDGET_TRANSACTION}/${id}`
  );
};

// POST: Tạo mới một budget transaction
const createBudgetTransaction = (data: CreateBudgetTransactionRequest) => {
  const form = new FormData();
  form.append("eventId", data.eventId);
  form.append("fromBudget", String(data.fromBudget));
  form.append("toBudget", String(data.toBudget));
  form.append("note", data.note ?? "");
  if(data.transactionImages){
    data.transactionImages.forEach((image) => {
      form.append(`transactionImages`, image);
    });
  }

  return request.post<BasicResponse<BudgetTransactionResponseItem>>(
    `${ROOT_BUDGET_TRANSACTION}`,
    form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

// PUT: Cập nhật thông tin của một budget transaction
const updateBudgetTransaction = (
  id: string,
  data: UpdateBudgetTransactionRequest
) => {

  const form = new FormData();
  form.append("eventId", data.eventId);
  form.append("fromBudget", String(data.fromBudget));
  form.append("toBudget", String(data.toBudget));
  form.append("note", data.note ?? "");
  if(data.transactionImages){
    data.transactionImages.forEach((image) => {
      form.append(`transactionImages`, image);
    });
  }

  return request.put<BasicResponse<boolean>>(
    `${ROOT_BUDGET_TRANSACTION}/${id}`,
    form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

// DELETE: Xóa một budget transaction
const deleteBudgetTransaction = (id: string) => {
  return request.delete<BasicResponse<boolean>>(
    `${ROOT_BUDGET_TRANSACTION}/${id}`
  );
};

const budgetTransactionApi = {
  getBudgetTransactionById,
  createBudgetTransaction,
  updateBudgetTransaction,
  deleteBudgetTransaction,
};

export default budgetTransactionApi;
