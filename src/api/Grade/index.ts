import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateGradeRequest } from "../../model/Request/Grade";
import { GradeResponse, GetMajorResponse } from "../../model/Response/Grade";

const request = axiosInstances.base;
const ROOT_GRADE= "/grades";

// GET: Lấy danh sách tất cả các grade
const getAllGrades = (majorId?: string, page?: number, size?: number) => {
  const params = {
    ...(majorId !== undefined && { majorId }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetMajorResponse>>(`${ROOT_GRADE}`, { params });
};

// POST: Tạo mới một grade
const createGrade = (data: CreateGradeRequest) => {
  return request.post<BasicResponse<GradeResponse>>(`${ROOT_GRADE}`, data);
};

// GET: Lấy thông tin chi tiết của grade
const getGradeById = (id: string) => {
  return request.get<BasicResponse<GradeResponse>>(`${ROOT_GRADE}/${id}`);
};

// DELETE: Xóa một grade
const deleteGrade = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_GRADE}/${id}`);
};

// GET: Lấy danh sách tất cả các catechists của một grade
const getCatechistsOfGrade = (id: string, excludeClassAssigned?: boolean, page?: number, size?: number,
  pastoralYearId?:string
) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
    ...(excludeClassAssigned !== undefined && { excludeClassAssigned }),
    ...(pastoralYearId !== undefined && { pastoralYearId }),
  };
  return request.get<BasicResponse<any>>(`${ROOT_GRADE}/${id}/catechists`, { params });
};

// GET: Lấy danh sách tất cả các lớp của một grade
const getClassesOfGrade = (id: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<any>>(`${ROOT_GRADE}/${id}/classes`, { params });
};

const gradeApi = {
  getAllGrades,
  createGrade,
  getGradeById,
  deleteGrade,
  getCatechistsOfGrade,
  getClassesOfGrade,
};

export default gradeApi;
