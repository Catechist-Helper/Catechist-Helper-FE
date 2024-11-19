import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CatechistResponse,GetClassResponse, GetSlotResponse } from "../../model/Response/Class";

// Tạo URL gốc cho API Class
const request = axiosInstances.base;
const ROOT_CLASS = "/classes";

// GET: Lấy danh sách tất cả các class
const getAllClasses = (majorId?:string, gradeId?: string, pastoralYearId?: string, page?: number, size?: number) => {
  const params = {    
    ...(majorId !== undefined && { majorId }),
    ...(gradeId !== undefined && { gradeId }),
    ...(pastoralYearId !== undefined && { pastoralYearId }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetClassResponse>>(`${ROOT_CLASS}`, { params });
};

// GET: Lấy danh sách tất cả catechists của một class
const getCatechistsOfClass = (classId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<CatechistResponse[]>>(`${ROOT_CLASS}/${classId}/catechists`, { params });
};

// GET: Lấy danh sách tất cả slots của một class
const getSlotsOfClass = (classId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetSlotResponse>>(`${ROOT_CLASS}/${classId}/slots`, { params });
};

const classApi = {
  getAllClasses,
  getCatechistsOfClass,
  getSlotsOfClass,
};

export default classApi;
