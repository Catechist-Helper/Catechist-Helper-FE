// src/model/Response/ParticipantInEvent.ts
export interface ParticipantResponseItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string; // ISO format
  address: string;
  isAttended: boolean;
  event: {
    id: string;
    name: string;
    description: string;
    isPeriodic: boolean;
    isCheckedIn: boolean;
    address: string;
    startTime: string; // ISO format
    endTime: string; // ISO format
    current_budget: number;
    eventStatus: number;
  };
}
