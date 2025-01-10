import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";

const request = axiosInstances.base;
const ROOT_CATECHIST_IN_SLOTS = "/catechist-in-slots";

export interface AvailableCatechistsBySlotId {
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

interface GetAvailableCatechistsBySlotIdResponse {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: AvailableCatechistsBySlotId[
  ]
}

const getAvailableCatechistsBySlotId = (id: string, excludeId?: string, page?: number, size?: number) => {
  const params = {
    ...(excludeId !== undefined && { excludeId }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetAvailableCatechistsBySlotIdResponse>>(`${ROOT_CATECHIST_IN_SLOTS}/${id}/search`, { params });
};

const findAvailableCatesExcludeId = (id: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetAvailableCatechistsBySlotIdResponse>>(`${ROOT_CATECHIST_IN_SLOTS}/${id}/find`, { params });
};

const catechistInSlotApi = {
  getAvailableCatechistsBySlotId,
  findAvailableCatesExcludeId
};

export default catechistInSlotApi;
