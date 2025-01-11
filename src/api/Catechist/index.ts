import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CatechistResponse, CatechistItemResponse } from "../../model/Response/Catechist";

// Tạo URL gốc cho API Catechist
const request = axiosInstances.base;
const ROOT_CATECHIST = "/catechists";

// GET: Lấy danh sách tất cả catechists với tham số mới
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

// POST: Tạo mới một catechist sử dụng form-data
const createCatechist = (data: FormData) => {
  return request.post<BasicResponse<CatechistItemResponse>>(`${ROOT_CATECHIST}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// PUT: Cập nhật thông tin của một catechist sử dụng form-data
const updateCatechist = (id: string, data: FormData) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_CATECHIST}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// DELETE: Xóa một catechist
const deleteCatechist = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_CATECHIST}/${id}`);
};

// PUT: Cập nhật hình ảnh của catechist (chỉ truyền ảnh)
const updateCatechistImage = (id: string, imageData: FormData) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_CATECHIST}/image/${id}`, imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// GET: Lấy danh sách chứng chỉ của một catechist
const getCatechistCertificates = (id: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<any>>(`${ROOT_CATECHIST}/${id}/certificates`, { params });
};

// GET: Lấy danh sách lớp của một catechist
const getCatechistClasses = (id: string, pastoralYear?: string, page?: number, size?: number) => {
  const params = {
    ...(pastoralYear !== undefined && { pastoralYear }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<any>>(`${ROOT_CATECHIST}/${id}/classes`, { params });
};

// GET: Lấy danh sách điểm số của một catechist
const getCatechistGrades = (id: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<{
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: {
      grade: {
          id: string,
          name: string,
          totalCatechist: number,
          major: {
            id: string,
            name: string,
            hierarchyLevel: number
          }
        },
        isMain: boolean
    }[];
  }>>(`${ROOT_CATECHIST}/${id}/grades`, { params });
};

const getTrainingsOfCatechist = (id: string) => {
  return request.get<BasicResponse<any>>(`${ROOT_CATECHIST}/${id}/training`);
};

const catechistApi = {
  getAllCatechists,
  getCatechistById,
  createCatechist,
  updateCatechist,
  deleteCatechist,
  updateCatechistImage,
  getCatechistCertificates,
  getCatechistClasses,
  getCatechistGrades,
  getTrainingsOfCatechist
};

export default catechistApi;
