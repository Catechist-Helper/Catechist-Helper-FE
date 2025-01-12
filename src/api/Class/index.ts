import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { GetCatechistClassResponse,GetClassResponse, GetSlotResponse } from "../../model/Response/Class";

// Tạo URL gốc cho API Class
const request = axiosInstances.base;
const ROOT_CLASS = "/classes";
type CatechistInSlotRequest = {
  catechistId: string;
  isMain: boolean;
};
type CreateSlotRequest = {
  catechists: CatechistInSlotRequest[];
};

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
  return request.get<BasicResponse<GetCatechistClassResponse>>(`${ROOT_CLASS}/${classId}/catechists`, { params });
};

// GET: Lấy danh sách tất cả slots của một class
const getSlotsOfClass = (classId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<GetSlotResponse>>(`${ROOT_CLASS}/${classId}/slots`, { params });
};

const updateRoomOfClass = (classId: string, data:{roomId?: string, isDeletedAllRoom?:boolean}) => {
  return request.patch<BasicResponse<boolean>>(`${ROOT_CLASS}/${classId}/room`, data);
};

const updateCatechitsOfClass = (classId: string, data: CreateSlotRequest) => {
  return request.patch<BasicResponse<boolean>>(`${ROOT_CLASS}/${classId}/catechists`, data);
};

const createClass = (data: {
  name: string,
  numberOfCatechist: number,
  note: string,
  pastoralYearId: string,
  gradeId: string
}) => {
  return request.post<BasicResponse<boolean>>(`${ROOT_CLASS}`, data);
};

const updateClass = (classId:string, data: {
  name: string,
  numberOfCatechist: number,
  note: string,
  pastoralYearId: string,
  gradeId: string
}) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_CLASS}/${classId}`, data);
};

const deleteClass = (classId:string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_CLASS}/${classId}`);
};

const updateSlotOfClass = (slotId: string, data: {
  catechistInSlots?: CatechistInSlotRequest[],
  date?: string,
  startTime?: string,
  endTime?: string,
  roomId?: string,
  isDeletedRoom?: boolean
}) => {
  return request.patch<BasicResponse<boolean>>(`slots/${slotId}`, data);
};

const classApi = {
  getAllClasses,
  getCatechistsOfClass,
  getSlotsOfClass,
  updateRoomOfClass,
  updateCatechitsOfClass,
  createClass,
  updateClass,
  deleteClass,
  updateSlotOfClass
};

export default classApi;
