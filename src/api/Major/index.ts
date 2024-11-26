import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateMajorRequest, UpdateMajorRequest } from "../../model/Request/Major";
import { MajorResponse, GetLevelResponse, GetMajorResponse, GetCatechistResponse } from "../../model/Response/Major";

// Tạo URL gốc cho API Major
const request = axiosInstances.base;
const ROOT_MAJOR = "/majors";

// GET: Lấy danh sách tất cả majors
const getAllMajors = (page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetMajorResponse>>(`${ROOT_MAJOR}`, { params });
};

// POST: Tạo mới một major
const createMajor = (data: CreateMajorRequest) => {
  return request.post<BasicResponse<MajorResponse>>(`${ROOT_MAJOR}`, data);
};

// GET: Lấy thông tin chi tiết của major
const getMajorById = (id: string) => {
  return request.get<BasicResponse<MajorResponse>>(`${ROOT_MAJOR}/${id}`);
};

// PUT: Cập nhật thông tin của major
const updateMajor = (id: string, data: UpdateMajorRequest) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_MAJOR}/${id}`, data);
};

// DELETE: Xóa một major
const deleteMajor = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_MAJOR}/${id}`);
};

// GET: Lấy danh sách tất cả catechists của một major
const getCatechistsOfMajor = (id: string, excludeGradeAssigned?: boolean, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
    ...(excludeGradeAssigned !== undefined && { excludeGradeAssigned }),
  };
  return request.get<BasicResponse<GetCatechistResponse>>(`${ROOT_MAJOR}/${id}/catechists`, { params });
};

// GET: Lấy danh sách tất cả levels của một major
const getLevelsOfMajor = (id: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetLevelResponse>>(`${ROOT_MAJOR}/${id}/levels`, { params });
};

// PUT: Gán một level cho một major
const assignLevelToMajor = (majorId: string, levelId: string) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_MAJOR}/${majorId}/levels/${levelId}`);
};

const majorApi = {
  getAllMajors,
  createMajor,
  getMajorById,
  updateMajor,
  deleteMajor,
  getCatechistsOfMajor,
  getLevelsOfMajor,
  assignLevelToMajor,
};

export default majorApi;
