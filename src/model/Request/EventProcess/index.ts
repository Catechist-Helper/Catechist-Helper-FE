// src/model/Request/EventProcess.ts

export interface CreateProcessRequest {
  name: string;
  description: string;
  duration?: {
    ticks: number;
  };
  startTime: string; // ISO format
  endTime: string;   // ISO format
  fee: number;
  status: number;
  eventId: string;   // ID của sự kiện
}

export interface UpdateProcessRequest extends CreateProcessRequest {}
