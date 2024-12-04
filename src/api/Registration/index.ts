import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { RegistrationResponse, RegistrationItemResponse } from "../../model/Response/Registration";

const request = axiosInstances.base;
const ROOT_REGISTRATION = "/registrations";

// GET: Lấy danh sách tất cả registrations với tham số mới
const getAllRegistrations = (startDate?: string, endDate?: string, status?: number, page?: number, size?: number,
  interviewStartDate?: string, interviewEndDate?: string
) => {
    const params = {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status !== undefined && { status }),
      ...(page !== undefined && { page }),
      ...(size !== undefined && { size }),
      ...(interviewStartDate !== undefined && { interviewStartDate }),
      ...(interviewEndDate !== undefined && { interviewEndDate }),
    };
    return request.get<BasicResponse<RegistrationResponse>>(`${ROOT_REGISTRATION}`, { params });
};
  
  // GET: Lấy thông tin chi tiết của một registration
  const getRegistrationById = (id: string) => {
    return request.get<BasicResponse<RegistrationItemResponse>>(`${ROOT_REGISTRATION}/${id}`);
  };

// POST: Tạo mới một registration sử dụng form-data
const createRegistration = (data: FormData) => {
  return axiosInstances.base.post<BasicResponse<RegistrationItemResponse>>(`/registrations`, data, {
    headers: {
      'Content-Type': 'multipart/form-data', // Đảm bảo gửi với định dạng FormData
    },
  });
};

// PUT: Cập nhật thông tin của một registration (JSON, không có file)
const updateRegistration = (id: string, data: { status: number; note?: string; reason?: string },) => {
  const updateData = {
    status: data.status,
    ...(data.reason && { reason: data.reason }),
    ...(data.note && { note: data.note }),
  };
  
  return request.put<BasicResponse<boolean>>(`${ROOT_REGISTRATION}/${id}`, updateData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// DELETE: Xóa một registration
const deleteRegistration = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_REGISTRATION}/${id}`);
};

// GET: Lấy danh sách interviews của một registration
const getInterviewsByRegistrationId = (registrationId: string) => {
    return request.get<BasicResponse<any>>(`${ROOT_REGISTRATION}/${registrationId}/interviews`);
};
  
// GET: Lấy danh sách interview processes của một registration
const getInterviewProcessesByRegistrationId = (registrationId: string) => {
    return request.get<BasicResponse<any>>(`${ROOT_REGISTRATION}/${registrationId}/interview-processes`);
};

const registrationApi = {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getInterviewsByRegistrationId,
  getInterviewProcessesByRegistrationId,
};

export default registrationApi;
