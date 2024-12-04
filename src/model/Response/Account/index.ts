// src/model/Response/account/AccountResponse.ts
export type RoleInAccountResponse = {
    id: string;
    roleName: string;
  };
  
export type AccountItemResponse = {
    id: string;
    email: string;
    fullName: string,
    gender: string,
    phone: string,
    avatar: string,
    role: RoleInAccountResponse;
  };
  
export type AccountResponse = {
    size: number,
    page: number,
    total: number,
    totalPages: number,
    items: AccountItemResponse[];
  };


  export type RecruitersByMeetingTimeItemResponse = {
    id: string;
    email: string;
    fullName: string,
    gender: string,
    phone: string,
    avatar: string,
    role: RoleInAccountResponse;
    interviews: InterviewResponse[];
  };

  export type RecruitersByMeetingTimeResponse = {
    size: number,
    page: number,
    total: number,
    totalPages: number,
    items: RecruitersByMeetingTimeItemResponse[];
  };

 type InterviewResponse = {
  id: string;
  meetingTime: string;
  note: string | null;
  isPassed: boolean;
  recruiters: RecruiterResponse[];
};

 type RecruiterResponse = {
  id: string,
  email: string,
  fullName: string,
  gender: string,
  phone: string,
  avatar: string,
  role: {
    id: string,
    roleName: string
  }
};

  
  