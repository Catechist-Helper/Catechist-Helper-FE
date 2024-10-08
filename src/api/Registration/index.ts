// src/api/Registration/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateRegistrationRequest } from "../../model/Request/Registration";
import { RegistrationResponse, RegistrationItemResponse } from "../../model/Response/Registration";

const request = axiosInstances.base;
const ROOT_REGISTRATION = "/registrations";

// GET: Lấy danh sách tất cả registrations (hỗ trợ phân trang)
const getAllRegistrations = (page?: number, size?: number) => {
    const params = {
      ...(page !== undefined && { page }),
      ...(size !== undefined && { size }),
    };
    return request.get<BasicResponse<RegistrationResponse>>(`${ROOT_REGISTRATION}`, { params });
  };
  
  // GET: Lấy thông tin chi tiết của một registration
  const getRegistrationById = (id: string) => {
    return request.get<BasicResponse<RegistrationItemResponse>>(`${ROOT_REGISTRATION}/${id}`);
  };

// POST: Tạo mới một registration
const createRegistration = (data: CreateRegistrationRequest) => {
  return request.post<BasicResponse<RegistrationItemResponse>>(`${ROOT_REGISTRATION}`, data);
};

// PUT: Cập nhật thông tin của một registration, có thể thêm các recruiters vào danh sách phỏng vấn
const updateRegistration = (id: string, data: { status: number; accounts?: string[] }) => {
  // Xử lý khi accounts có thể không tồn tại
  const updateData = {
    status: data.status,
    ...(data.accounts && { accounts: data.accounts }), // Chỉ thêm trường accounts nếu nó tồn tại
  };
  
  return request.put<BasicResponse<boolean>>(`${ROOT_REGISTRATION}/${id}`, updateData);
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
