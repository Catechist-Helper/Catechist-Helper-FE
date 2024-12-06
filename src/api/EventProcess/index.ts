import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import {
  CreateProcessRequest,
  UpdateProcessRequest,
} from "../../model/Request/EventProcess";

import {
  ProcessResponseItem, GetMemberOfProcessResponse
} from "../../model/Response/Event";

const request = axiosInstances.base;
const ROOT_EVENT_PROCESS = "/processes";

// POST: Tạo mới một process cho một event
const createProcess = (data: CreateProcessRequest) => {
  return request.post<BasicResponse<ProcessResponseItem>>(`${ROOT_EVENT_PROCESS}`, data);
};

// GET: Lấy thông tin chi tiết của một process
const getProcessById = (processId: string) => {
  return request.get<BasicResponse<ProcessResponseItem>>(`${ROOT_EVENT_PROCESS}/${processId}`);
};

// PUT: Cập nhật thông tin một process
const updateProcess = (processId: string, data: UpdateProcessRequest) => {
  return request.put<BasicResponse<ProcessResponseItem>>(`${ROOT_EVENT_PROCESS}/${processId}`, data);
};

// DELETE: Xóa một process của event
const deleteProcess = (processId: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_EVENT_PROCESS}/${processId}`);
};

const getMembersOfProcess = (id: string, processId: string, page?: number, size?: number) => {
  const params = {
    id: id,
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetMemberOfProcessResponse>>(`/members/${processId}`, {
    params,
  });
};

const processApi = {
  createProcess,
  getProcessById,
  updateProcess,
  deleteProcess,
  getMembersOfProcess
};

export default processApi;
