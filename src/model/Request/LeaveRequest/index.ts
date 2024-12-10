export interface SubmitLeaveRequest {
  catechistId: string; // ID người yêu cầu
  reason: string; // Lý do
  leaveDate: string;
}
export interface ProcessLeaveRequest {
  requestId: string; // ID của yêu cầu
  approverId: string; // ID người phê duyệt
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  comment: string; // Ghi chú
}
