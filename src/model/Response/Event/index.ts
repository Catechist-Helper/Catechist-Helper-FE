// src/model/Response/Event.ts
export interface EventItemResponse {
  id: string;
  name: string;
  description: string;
  isPeriodic: boolean;
  isCheckedIn: boolean;
  address: string;
  startTime: string;
  endTime: string;
  current_budget: number;
  eventStatus: number;
  eventCategoryId: string;
  eventCategory?: any;
}

export interface EventResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: EventItemResponse[];
}

// src/model/Response/EventDetails.ts

export interface ProcessResponseItem {
  id: string;
  name: string;
  description: string;
  duration: {
    ticks: number;
    days: number;
    hours: number;
    milliseconds: number;
    microseconds: number;
    nanoseconds: number;
    minutes: number;
    seconds: number;
    totalDays: number;
    totalHours: number;
    totalMilliseconds: number;
    totalMicroseconds: number;
    totalNanoseconds: number;
    totalMinutes: number;
    totalSeconds: number;
  };
  startTime: string;
  endTime: string;
  fee: number;
  status: number;
  eventId: string;
}

export interface ParticipantResponseItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  isAttended: boolean;
  event: {
    id: string;
    name: string;
    description: string;
    isPeriodic: boolean;
    isCheckedIn: boolean;
    address: string;
    startTime: string;
    endTime: string;
    current_budget: number;
    eventStatus: number;
  };
}

export interface BudgetTransactionResponseItem {
  id: string;
  fromBudget: number;
  toBudget: number;
  event: {
    id: string;
    name: string;
    description: string;
    isPeriodic: boolean;
    isCheckedIn: boolean;
    address: string;
    startTime: string;
    endTime: string;
    current_budget: number;
    eventStatus: number;
  };
}

export interface ProcessResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: ProcessResponseItem[];
}

export interface ParticipantResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: ParticipantResponseItem[];
}

export interface BudgetTransactionResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: BudgetTransactionResponseItem[];
}

