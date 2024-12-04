import axiosInstances from "../../config/axios";
import { AbsenceResponse } from "../../model/Response/AbsenceRequest";
import {
  SubmitAbsenceRequest,
  ProcessAbsenceRequest,
  AssignReplacementRequest,
} from "../../model/Request/AbsenceRequest";

const request = axiosInstances.base;
const ROOT_API = "/absences";

// 1. POST: Gửi yêu cầu vắng mặt
const submitAbsence = (data: SubmitAbsenceRequest) => {
  return request.post<AbsenceResponse<boolean>>(`${ROOT_API}/submit`, data);
};

// 2. POST: Xử lý yêu cầu vắng mặt (Phê duyệt hoặc Từ chối)
const processAbsence = (data: ProcessAbsenceRequest) => {
  return request.post<AbsenceResponse<boolean>>(`${ROOT_API}/process`, data);
};

// 3. POST: Gán người thay thế
const assignReplacement = (data: AssignReplacementRequest) => {
  return request.post<AbsenceResponse<boolean>>(`${ROOT_API}/assign`, data);
};

// 4. GET: Lấy danh sách yêu cầu vắng mặt
const getAbsences = (status?: number) => {
  const params = {
    ...(status !== undefined && { status }),
  };
  return request.get<AbsenceResponse<any>>(`${ROOT_API}`, { params });
};

const absenceApi = {
  submitAbsence,
  processAbsence,
  assignReplacement,
  getAbsences,
};

export default absenceApi;
