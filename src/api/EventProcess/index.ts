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
  const form = new FormData();
  form.append("Name", data.name);
  form.append("Description", data.description);
  form.append("StartTime", data.startTime);
  form.append("EndTime", data.endTime);
  form.append("Fee", data.fee.toString());
  if(data.actualFee){form.append("ActualFee", data.actualFee.toString());}
  if(data.note){form.append("Note", data.note);}
  form.append("Status", data.status.toString());
  form.append("EventId", data.eventId);
  if(data.receiptImages){
    data.receiptImages.forEach((image) => {
      form.append(`ReceiptImages`, image);
    });
  }

  return request.put<BasicResponse<ProcessResponseItem>>(`${ROOT_EVENT_PROCESS}/${processId}`,
    form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

const approveProcess = (processId: string, data: {
  comment?: string,
  status: number
}) => {
  return request.put<BasicResponse<ProcessResponseItem>>(`${ROOT_EVENT_PROCESS}/${processId}/approve`, data);
};

const processApi = {
  createProcess,
  getProcessById,
  updateProcess,
  deleteProcess,
  getMembersOfProcess,
  approveProcess
};

export default processApi;
