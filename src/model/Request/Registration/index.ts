// src/model/Request/Registration/CreateRegistrationRequest.ts
export type CreateRegistrationRequest = {
    fullName: string;
    gender: string;
    dateOfBirth: string;
    address: string;
    email: string;
    phone: string;
    isTeachingBefore: boolean;
    yearOfTeaching: number;
    note?: string;
    images?: string[] | null;
  };
  