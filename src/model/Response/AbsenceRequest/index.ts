// Response chung từ backend
export interface AbsenceResponse<T = any> {
  statusCode: number;
  message: string | null;
  data: T;
}

interface SlotResponse {
  id: string,
  date: string,
  startTime: string,
  endTime: string,
  note: string | null,
  classId: string,
  className: string,
  roomName: string
}

export interface GetAbsenceItemResponse {
  id: string,
      status: number,
      approverId: string|null,
      comment: string,
      approvalDate: string|null,
      createAt: string,
      updateAt: string,
      catechistName: string,
      replacementCatechistName: string|null,
      approver: string|null,
      catechistId: string,
      slotId: string,
      reason: string,
      replacementCatechistId: string|null,
      slot: SlotResponse,
      requestImages:RequestImageResponse[]
}

export interface RequestImageResponse {
  id: string,
  absenceRequestId: string,
  imageUrl: string,
  uploadAt: string
}
