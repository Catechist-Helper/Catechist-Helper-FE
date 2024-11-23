// src/model/Request/ParticipantInEvent.ts
export interface CreateParticipantRequest {
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string; // ISO format
    address: string;
    eventId: string;
  }
  
  export interface UpdateParticipantRequest {
    isAttended: boolean;
  }
  