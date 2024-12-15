// Gửi yêu cầu vắng mặt
export interface SubmitAbsenceRequest {
  catechistId: string; // ID người yêu cầu
  slotId: string; // ID của slot
  reason: string; // Lý do
  replacementCatechistId?: string;
  
}

// Xử lý yêu cầu (phê duyệt hoặc từ chối)
export interface ProcessAbsenceRequest {
  requestId: string; // ID của yêu cầu
  approverId: string; // ID người phê duyệt
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  comment: string; // Ghi chú
}

// Gán người thay thế
export interface AssignReplacementRequest {
  requestId: string; // ID của yêu cầu
  replacementCatechistId: string; // ID người thay thế
  type: number;
}
