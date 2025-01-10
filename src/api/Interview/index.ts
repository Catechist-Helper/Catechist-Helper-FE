// src/api/Interview/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";

const request = axiosInstances.base;
const ROOT_INTERVIEW = "/interviews";

// POST: Tạo mới một interview
const createInterview = (data: { registrationId: string; meetingTime: string, interviewType: number; accounts: string[] }) => {
  return request.post<BasicResponse<any>>(`${ROOT_INTERVIEW}`, data);
};

// PUT: Cập nhật thông tin của một interview
const updateInterview = (id: string, data: { meetingTime: string | null; note?: string | null;
   isPassed?: boolean; reason?: string; accounts?: string[]; emailInterview?: boolean }) => {
    return request.put<BasicResponse<any>>(`${ROOT_INTERVIEW}/${id}`, data);
  };
  
// DELETE: Xóa một interview
const deleteInterview = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_INTERVIEW}/${id}`);
};

const evaluateInterview = (id: string, data: {
  evaluation: string,
  recruiterAccountId: string
}) => {
  return request.put<BasicResponse<any>>(`${ROOT_INTERVIEW}/${id}/evaluate`, data);
};

const interviewApi = {
  createInterview,
  updateInterview,
  deleteInterview,
  evaluateInterview
};

export default interviewApi;
