// src/api/InterviewProcess/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";

const request = axiosInstances.base;
const ROOT_INTERVIEW_PROCESS = "/registration-processes";

// POST: Tạo mới một interview process
const createInterviewProcess = (data: { registrationId: string; name: string }) => {
  return request.post<BasicResponse<any>>(`${ROOT_INTERVIEW_PROCESS}`, data);
};

// PUT: Cập nhật thông tin của một interview process
const updateInterviewProcess = (id: string, data: { name: string; status: number }) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_INTERVIEW_PROCESS}/${id}`, data);
};

// DELETE: Xóa một interview process
const deleteInterviewProcess = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_INTERVIEW_PROCESS}/${id}`);
};

const interviewProcessApi = {
  createInterviewProcess,
  updateInterviewProcess,
  deleteInterviewProcess,
};

export default interviewProcessApi;
