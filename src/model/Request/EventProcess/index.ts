// src/model/Request/EventProcess.ts

export interface CreateProcessRequest {
  name: string;
  description: string;
  duration?: number;
  startTime: string; // ISO format
  endTime: string;   // ISO format
  fee: number;
  actualFee?: number;
  note?: string;
  status: number;
  eventId: string;   // ID của sự kiện
}

export interface UpdateProcessRequest extends CreateProcessRequest {}
