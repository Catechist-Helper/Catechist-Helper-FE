import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CatechistResponse, CatechistItemResponse } from "../../model/Response/Catechist";

// Tạo URL gốc cho API Catechist
const ROOT_CATECHIST = "/catechists";

// GET: Lấy danh sách tất cả catechists với tham số mới
const getAllCatechists = (page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return axiosInstances.base.get<BasicResponse<CatechistResponse>>(`${ROOT_CATECHIST}`, { params });
};

// GET: Lấy thông tin chi tiết của một catechist
const getCatechistById = (id: string) => {
  return axiosInstances.base.get<BasicResponse<CatechistItemResponse>>(`${ROOT_CATECHIST}/${id}`);
};

// POST: Tạo mới một catechist sử dụng form-data
const createCatechist = (data: FormData) => {
  return axiosInstances.base.post<BasicResponse<CatechistItemResponse>>(`${ROOT_CATECHIST}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// PUT: Cập nhật thông tin của một catechist sử dụng form-data
const updateCatechist = (id: string, data: FormData) => {
  return axiosInstances.base.put<BasicResponse<boolean>>(`${ROOT_CATECHIST}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// DELETE: Xóa một catechist
const deleteCatechist = (id: string) => {
  return axiosInstances.base.delete<BasicResponse<boolean>>(`${ROOT_CATECHIST}/${id}`);
};

// PUT: Cập nhật hình ảnh của catechist (chỉ truyền ảnh)
const updateCatechistImage = (id: string, imageData: FormData) => {
  return axiosInstances.base.put<BasicResponse<boolean>>(`${ROOT_CATECHIST}/image/${id}`, imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const catechistApi = {
  getAllCatechists,
  getCatechistById,
  createCatechist,
  updateCatechist,
  deleteCatechist,
  updateCatechistImage,
};

export default catechistApi;
