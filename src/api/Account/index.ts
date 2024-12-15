// src/api/Account/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { AccountResponse, AccountItemResponse, RecruitersByMeetingTimeResponse } from "../../model/Response/Account";
import { EventCalendar } from "../../pages/common/Calendar/Calendar";

const request = axiosInstances.base;
const ROOT_ACCOUNT = "/accounts";

// GET: Lấy danh sách tất cả accounts (page và size không bắt buộc)
const getAllAccounts = (page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<AccountResponse>>(`${ROOT_ACCOUNT}`, { params });
};

// POST: Tạo mới một account với multipart/form-data
const createAccount = (data: FormData) => {
  return request.post<BasicResponse<AccountItemResponse>>(`${ROOT_ACCOUNT}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// GET: Lấy thông tin chi tiết của một account
const getAccountById = (id: string) => {
  return request.get<BasicResponse<AccountResponse>>(`${ROOT_ACCOUNT}/${id}`);
};

// PUT: Cập nhật thông tin của một account với multipart/form-data
const updateAccount = (id: string, data: FormData) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_ACCOUNT}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// DELETE: Xóa một account
const deleteAccount = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_ACCOUNT}/${id}`);
};

const getRecruitersByMeetingTime = (meetingTime:string, page?: number, size?: number) => {
  const params = {
    ...(meetingTime !== undefined && { meetingTime }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<RecruitersByMeetingTimeResponse>>(`${ROOT_ACCOUNT}/recruiters`, { params });
};

const getCalendarOfAccount = (id: string) => {
  return request.get<BasicResponse<EventCalendar[]>>(`${ROOT_ACCOUNT}/${id}/calendar`);
};

const updatePassword = ( data: 
  {
    email: string,
    newPassword: string,
    oldPassword: string
  }) => {
  return request.patch<BasicResponse<boolean>>(`${ROOT_ACCOUNT}`, data);
};

const accountApi = {
  getAllAccounts,
  createAccount,
  getAccountById,
  updateAccount,
  deleteAccount,
  getRecruitersByMeetingTime,
  getCalendarOfAccount,
  updatePassword
};

export default accountApi;
