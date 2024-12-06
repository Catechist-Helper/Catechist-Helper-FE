import axiosInstances from "../../config/axios";
import { BasicResponse } from "../../model/Response/BasicResponse";
import {
  UpdateMemberRequest,
  UpdateMemberOfProcessRequest,
} from "../../model/Request/EventMember";

const request = axiosInstances.base;
const ROOT_MEMBER = "/members";

// PUT: Cập nhật thông tin thành viên của một event
const updateEventMember = (eventId: string, data: UpdateMemberRequest[]) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_MEMBER}/${eventId}`, data);
};

// PUT: Cập nhật thông tin thành viên của một process
const updateProcessMember = (processId: string, data: UpdateMemberOfProcessRequest[]) => {
  return request.put<BasicResponse<boolean>>(`${ROOT_MEMBER}`, {params:{processId}, data});
};

const memberApi = {
  updateEventMember,
  updateProcessMember,
};

export default memberApi;
