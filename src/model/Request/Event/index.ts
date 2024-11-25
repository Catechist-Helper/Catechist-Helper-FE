// src/model/Request/Event.ts
export interface CreateEventRequest {
  name: string;
  description: string;
  isPeriodic: boolean;
  isCheckedIn: boolean;
  address: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  current_budget: number;
  eventStatus: number;
  eventCategoryId: string;
}

export interface UpdateEventRequest extends CreateEventRequest {}
