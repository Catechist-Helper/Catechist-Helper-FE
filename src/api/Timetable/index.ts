import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CreateSlotRequest } from "../../model/Request/Slot";

// Tạo URL gốc cho API Timetable và Slot
const request = axiosInstances.base;
const ROOT_TIMETABLE = "/timetable";
const ROOT_SLOTS = "/slots";
const ROOT_CLASSES_EXPORT = "/classes/export";
const ROOT_PASTORAL_YEAR_EXPORT = "/pastoral-years/export";
const ROOT_CATECHISTS_EXPORT = "/catechists/export";

// POST: Tạo mới Timetable, nhận file .xlsx
const createTimetable = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post<BasicResponse<any>>(`${ROOT_TIMETABLE}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// POST: Tạo mới Slot
const createSlot = (data: CreateSlotRequest) => {
  return request.post<BasicResponse<any>>(`${ROOT_SLOTS}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// GET: Export data của một Class dưới dạng file .xlsx
const exportClassData = (classId: string) => {
  return request.get(`${ROOT_CLASSES_EXPORT}/${classId}`, {
    responseType: "blob", // Nhận về file Excel
  });
};

// GET: Export data của một Pastoral Year dưới dạng file .xlsx
const exportPastoralYearData = (year: string) => {
  return request.get(`${ROOT_PASTORAL_YEAR_EXPORT}`, {
    params: { year },
    responseType: "blob", // Nhận về file Excel
  });
};ROOT_CATECHISTS_EXPORT

// GET: Export data của catechists dưới dạng file .xlsx
const exportCatechistData = () => {
  return request.get(`${ROOT_CATECHISTS_EXPORT}`, {
    responseType: "blob", // Nhận về file Excel
  });
};

const timetableApi = {
  createTimetable,
  createSlot,
  exportClassData,
  exportPastoralYearData,
  exportCatechistData
};

export default timetableApi;
