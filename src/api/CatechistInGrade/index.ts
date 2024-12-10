import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateCatechistInGradeRequest, ReplaceCatechistInGradeRequest } from "../../model/Request/CatechistInGrade";

// Tạo URL gốc cho API CatechistInGrade
const request = axiosInstances.base;
const ROOT_CATECHIST_IN_GRADE = "/catechist-in-grades";

// POST: Tạo mới CatechistInGrade
const createCatechistInGrade = (data: CreateCatechistInGradeRequest) => {
  return request.post<BasicResponse<boolean>>(`${ROOT_CATECHIST_IN_GRADE}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const replaceCatechistToAnotherGrade = (data: ReplaceCatechistInGradeRequest) => {
  return request.patch<BasicResponse<boolean>>(`${ROOT_CATECHIST_IN_GRADE}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const catechistInGradeApi = {
  createCatechistInGrade,replaceCatechistToAnotherGrade
};

export default catechistInGradeApi;
