import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateCatechistInClassRequest } from "../../model/Request/CatechistInClass";

// Tạo URL gốc cho API CatechistInClass
const request = axiosInstances.base;
const ROOT_CATECHIST_IN_CLASS = "/catechist-in-classes";

// POST: Tạo mới CatechistInClass
const createCatechistInClass = (data: CreateCatechistInClassRequest) => {
  return request.post<BasicResponse<boolean>>(`${ROOT_CATECHIST_IN_CLASS}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export interface AbsenceReplacementAvailableCatechistItem {
  id: string,
  code: string,
  fullName: string,
  gender: string,
  dateOfBirth: string,
  christianName: string,
  level: string,
  grade: string,
  major: string
}

interface GetAbsenceReplacementAvailableCatechistsResponse {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: AbsenceReplacementAvailableCatechistItem[
  ]
}

const getAbsenceReplacementAvailableCatechists = (id: string, excludeId?: string, page?: number, size?: number) => {
  const params = {
    ...(excludeId !== undefined && { excludeId }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetAbsenceReplacementAvailableCatechistsResponse>>(`${ROOT_CATECHIST_IN_CLASS}/${id}/search`, { params });
};

const catechistInClassApi = {
  createCatechistInClass,
  getAbsenceReplacementAvailableCatechists
};

export default catechistInClassApi;
