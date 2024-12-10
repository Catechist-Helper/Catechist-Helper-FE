import axiosInstances from "../../config/axios";
import { GetLeaveRequestItemResponse } from "../../model/Response/LeaveRequest";
import {
  SubmitLeaveRequest,
  ProcessLeaveRequest,
} from "../../model/Request/LeaveRequest";
import { BasicResponse } from "../../model/Response/BasicResponse";

const request = axiosInstances.base;
const ROOT_API = "/leavers";

const submitLeaveRequest = (data: SubmitLeaveRequest) => {
  return request.post<BasicResponse<boolean>>(`${ROOT_API}/submit`, data);
};

const processLeaveRequest = (data: ProcessLeaveRequest) => {
  return request.post<BasicResponse<boolean>>(`${ROOT_API}/process`, data);
};

const getLeaveRequests = (status?: number, cId?: string) => {
  const params = {
    ...(status !== undefined && { status }),
    ...(cId !== undefined && { cId }),
  };
  return request.get<BasicResponse<GetLeaveRequestItemResponse[]>>(`${ROOT_API}`, { params });
};

const leaveRequestApi = {
  submitLeaveRequest,
  processLeaveRequest,
  getLeaveRequests,
};

export default leaveRequestApi;
