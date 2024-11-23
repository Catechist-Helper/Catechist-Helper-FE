// src/api/EventCategory/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import {
  CreateEventCategoryRequest,
  UpdateEventCategoryRequest,
} from "../../model/Request/EventCategory";
import {
  EventCategoryResponse,
  EventCategoryItemResponse,
} from "../../model/Response/EventCategory";

const request = axiosInstances.base;
const ROOT_EVENT_CATEGORY = "/event-categories";

// GET: Lấy danh sách tất cả event categories (page và size không bắt buộc)
const getAllEventCategories = (page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<EventCategoryResponse>>(
    `${ROOT_EVENT_CATEGORY}`,
    { params }
  );
};

// POST: Tạo mới một event category
const createEventCategory = (data: CreateEventCategoryRequest) => {
  return request.post<BasicResponse<EventCategoryItemResponse>>(
    `${ROOT_EVENT_CATEGORY}`,
    data
  );
};

// GET: Lấy thông tin chi tiết của một event category
const getEventCategoryById = (id: string) => {
  return request.get<BasicResponse<EventCategoryItemResponse>>(
    `${ROOT_EVENT_CATEGORY}/${id}`
  );
};

// PUT: Cập nhật thông tin của một event category
const updateEventCategory = (id: string, data: UpdateEventCategoryRequest) => {
  return request.put<BasicResponse<boolean>>(
    `${ROOT_EVENT_CATEGORY}/${id}`,
    data
  );
};

// DELETE: Xóa một event category
const deleteEventCategory = (id: string) => {
  return request.delete<BasicResponse<boolean>>(
    `${ROOT_EVENT_CATEGORY}/${id}`
  );
};

const eventCategoryApi = {
  getAllEventCategories,
  createEventCategory,
  getEventCategoryById,
  updateEventCategory,
  deleteEventCategory,
};

export default eventCategoryApi;
