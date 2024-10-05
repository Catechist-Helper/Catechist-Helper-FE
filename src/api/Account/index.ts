// src/api/Account/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateAccountRequest, UpdateAccountRequest } from "../../model/Request/Account";
import { AccountResponse } from "../../model/Response/Account";

const request = axiosInstances.base;
const ROOT_ACCOUNT = "/accounts";

// GET: Lấy danh sách tất cả accounts (page và size không bắt buộc)
const getAllAccounts = (page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size })
  };
  return request.get<BasicResponse<AccountResponse[]>>(`${ROOT_ACCOUNT}`, { params });
};

// POST: Tạo mới một account
const createAccount = (data: CreateAccountRequest) => {
  return request.post<BasicResponse<AccountResponse>>(`${ROOT_ACCOUNT}`, data);
};

// GET: Lấy thông tin chi tiết của một account
const getAccountById = (id: string) => {
  return request.get<BasicResponse<AccountResponse>>(`${ROOT_ACCOUNT}/${id}`);
};

// PUT: Cập nhật thông tin của một account
const updateAccount = (id: string, data: UpdateAccountRequest) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_ACCOUNT}/${id}`, data);
};

// DELETE: Xóa một account
const deleteAccount = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_ACCOUNT}/${id}`);
};

const accountApi = {
  getAllAccounts,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount
};

export default accountApi;
