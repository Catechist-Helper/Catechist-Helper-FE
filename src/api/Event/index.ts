// src/api/Events/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import {
  CreateEventRequest,
  UpdateEventRequest,
} from "../../model/Request/Event";
import {
  EventResponse,
  EventItemResponse,
  MemberResponse,
  ProcessResponse, ParticipantResponse, BudgetTransactionResponse
} from "../../model/Response/Event";

const request = axiosInstances.base;
const ROOT_EVENT = "/events";

// GET: Lấy danh sách tất cả events (page và size không bắt buộc)
const getAllEvents = (eventCategoryId?:string, page?: number, size?: number) => {
  const params = {
    ...(eventCategoryId !== undefined && { eventCategoryId }),
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<EventResponse>>(`${ROOT_EVENT}`, {
    params,
  });
};

// POST: Tạo mới một event
const createEvent = (data: CreateEventRequest) => {
  return request.post<BasicResponse<EventItemResponse>>(`${ROOT_EVENT}`, data);
};

// GET: Lấy thông tin chi tiết của một event
const getEventById = (id: string) => {
  return request.get<BasicResponse<EventItemResponse>>(`${ROOT_EVENT}/${id}`);
};

// PUT: Cập nhật thông tin của một event
const updateEvent = (id: string, data: UpdateEventRequest) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_EVENT}/${id}`, data);
};

// DELETE: Xóa một event
const deleteEvent = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_EVENT}/${id}`);
};

// GET: Lấy danh sách thành viên của một event
const getEventMembers = (eventId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<MemberResponse>>(`/events/${eventId}/members`, {
    params,
  });
};

// GET: Lấy danh sách giao dịch ngân sách của một event
const getEventBudgetTransactions = (eventId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<BudgetTransactionResponse>>(`/events/${eventId}/budget-transactions`, {
    params,
  });
};

// GET: Lấy danh sách các process của một event
const getEventProcesses = (eventId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<ProcessResponse>>(`/events/${eventId}/processes`, {
    params,
  });
};

// GET: Lấy danh sách các participants của một event
const getEventParticipants = (eventId: string, page?: number, size?: number) => {
  const params = {
    ...(page !== undefined && { page }),
    ...(size !== undefined && { size }),
  };
  return request.get<BasicResponse<ParticipantResponse>>(`/events/${eventId}/participants`, {
    params,
  });
};

const addListParticipants = (eventId: string, data: FormData) => {
  return request.post<BasicResponse<ParticipantResponse>>(`/events/${eventId}/participants`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


const eventApi = {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventMembers,
  getEventBudgetTransactions,
  getEventProcesses,
  getEventParticipants,
  addListParticipants
};

export default eventApi;
