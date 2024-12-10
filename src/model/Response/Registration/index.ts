// src/model/Response/Registration/RegistrationResponse.ts

// Mô hình cho CertificateOfCandidates
export type CertificateOfCandidateResponse = {
  id: string;
  imageUrl: string;
};

// Mô hình cho Interviews
export type InterviewResponse = {
  id: string;
  meetingTime: string;
  note: string | null;
  isPassed: boolean;
  interviewType: number;
  recruiters: RecruiterResponse[];
  recruiterInInterviews: recruiterInInterviewItemResponse[];
};

// Mô hình cho InterviewProcesses
export type InterviewProcessResponse = {
  id: string;
  name: string;
  status: number;
  createdAt: string;
};

// Mô hình cho Recruiters
export type RecruiterResponse = {
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

// Mô hình cho Registration Item (chi tiết từng mục)
export type RegistrationItemResponse = {
  id: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  email: string;
  phone: string;
  isTeachingBefore: boolean;
  yearOfTeaching: number;
  note?: string;
  status: number;
  createdAt: string;
  certificateOfCandidates: CertificateOfCandidateResponse[];
  interview: InterviewResponse;
  registrationProcesses: InterviewProcessResponse[];
};

export type recruiterInInterviewItemResponse= {
  accountId:string,
  onlineRoomUrl:string|null
}

// Mô hình cho phản hồi của danh sách Registration (hỗ trợ phân trang)
export type RegistrationResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: RegistrationItemResponse[];
};
