// src/api/ParticipantInEvent/index.ts
import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import {
  CreateParticipantRequest,
  UpdateParticipantRequest,
} from "../../model/Request/ParticipantInEvent";
import {
    ParticipantResponseItem
  } from "../../model/Response/ParticipantInEvent";

const request = axiosInstances.base;
const ROOT_PARTICIPANT = "/participant-in-events";

// GET: Lấy thông tin chi tiết của một participant
const getParticipantById = (id: string) => {
  return request.get<BasicResponse<ParticipantResponseItem>>(
    `${ROOT_PARTICIPANT}/${id}`
  );
};

// POST: Thêm mới một participant vào event
const createParticipant = (data: CreateParticipantRequest) => {
  return request.post<BasicResponse<ParticipantResponseItem>>(
    `${ROOT_PARTICIPANT}`,
    data
  );
};

// PUT: Cập nhật thông tin participant trong event
const updateParticipant = (id: string, data: UpdateParticipantRequest) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_PARTICIPANT}/${id}`, data);
};

// DELETE: Xóa một participant khỏi event
const deleteParticipant = (id: string) => {
  return request.delete<BasicResponse<boolean>>(`${ROOT_PARTICIPANT}/${id}`);
};

const participantInEventApi = {
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant,
};

export default participantInEventApi;
