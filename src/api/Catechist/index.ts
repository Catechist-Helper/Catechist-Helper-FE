import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateCatechistRequest } from "../../model/Request/Catechist";
import { CatechistResponse, CatechistItemResponse } from "../../model/Response/Catechist";

const request = axiosInstances.base;
const ROOT_CATECHIST = "/catechists";

// GET: Lấy danh sách tất cả catechists (hỗ trợ phân trang)
const getAllCatechists = (page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<CatechistResponse>>(`${ROOT_CATECHIST}`, { params });
};

// GET: Lấy thông tin chi tiết của một catechist
const getCatechistById = (id: string) => {
  return request.get<BasicResponse<CatechistItemResponse>>(`${ROOT_CATECHIST}/${id}`);
};

// POST: Tạo mới một catechist
const createCatechist = (data: CreateCatechistRequest) => {
  return request.post<BasicResponse<CatechistItemResponse>>(`${ROOT_CATECHIST}`, data);
};

// PUT: Cập nhật thông tin của một catechist
const updateCatechist = (id: string, data: CreateCatechistRequest) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_CATECHIST}/${id}`, data);
};

// DELETE: Xóa một catechist
const deleteCatechist = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_CATECHIST}/${id}`);
};

const catechistApi = {
  getAllCatechists,
  getCatechistById,
  createCatechist,
  updateCatechist,
  deleteCatechist,
};

export default catechistApi;
