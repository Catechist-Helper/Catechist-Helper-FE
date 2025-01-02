// src/model/Request/EventProcess.ts

export interface CreateProcessRequest {
  name: string;
  description: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
  fee: number;
  actualFee?: number;
  note?: string;
  status: number;
  eventId: string;   // ID của sự kiện
  receiptImages?: File[]
}

export interface UpdateProcessRequest extends CreateProcessRequest {}
