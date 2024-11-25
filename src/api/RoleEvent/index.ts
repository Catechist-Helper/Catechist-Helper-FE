import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";

// URL gốc của RoleEvent
const ROOT_ROLE_EVENT = "/role-events";
const request = axiosInstances.base;

// Interface cho RoleEvent
export interface RoleEventItem {
  id: string;
  name: string;
  description: string;
}

export interface RoleEventResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: RoleEventItem[];
}

// GET: Lấy danh sách RoleEvent với phân trang
const getAllRoleEvents = (page = 1, size = 100) => {
  const params = { page, size };
  return request.get<BasicResponse<RoleEventResponse>>(ROOT_ROLE_EVENT, {
    params,
  });
};

// POST: Tạo mới một RoleEvent
const createRoleEvent = (data: { name: string; description: string }) => {
  return request.post<BasicResponse<RoleEventItem>>(ROOT_ROLE_EVENT, data);
};

// GET: Lấy thông tin chi tiết một RoleEvent
const getRoleEventById = (id: string) => {
  return request.get<BasicResponse<RoleEventItem>>(`${ROOT_ROLE_EVENT}/${id}`);
};

// PUT: Cập nhật thông tin một RoleEvent
const updateRoleEvent = (
  id: string,
  data: { name: string; description: string }
) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_ROLE_EVENT}/${id}`, data);
};

// DELETE: Xóa một RoleEvent
const deleteRoleEvent = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_ROLE_EVENT}/${id}`);
};

// Export các phương thức
const roleEventApi = {
  getAllRoleEvents,
  createRoleEvent,
  getRoleEventById,
  updateRoleEvent,
  deleteRoleEvent,
};

export default roleEventApi;
