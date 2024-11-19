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

const catechistInClassApi = {
  createCatechistInClass,
};

export default catechistInClassApi;
