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
  duration: number;
  startTime: string;
  endTime: string;
  fee: number;
  actualFee: number;
  note: string;
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
  transactionAt: string;
  note: string;
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
  transactionImages: 
  BudgetTransactionImage[]
}

export interface BudgetTransactionImage {
  id: string,
  budgetTransactionId: string,
  imageUrl: string,
  uploadAt: string
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

export interface RoleResponse {
  id: string;
  roleName: string;
}

interface AccountResponse {
  id: string;
  email: string;
  fullName: string;
  gender: string;
  phone: string;
  avatar: string;
  role: RoleResponse;
}

interface RoleEventResponse {
  id: string;
  name: string;
  description: string;
}

export interface MemberItemResponse {
  account: AccountResponse;
  roleEvent: RoleEventResponse;
  roleEventId: string;
}

export interface MemberResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: MemberItemResponse[];
}


export interface BudgetTransactionResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: BudgetTransactionResponseItem[];
}


export type RoleInAccountResponse = {
  id: string;
  roleName: string;
};

export type MemberOfProcessItemResponse = {
  getAccountResponse:{
  id: string;
  email: string;
  fullName: string,
  gender: string,
  phone: string,
  avatar: string,
  role: RoleInAccountResponse;},
  isMain:boolean;
};

export type GetMemberOfProcessResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: MemberOfProcessItemResponse[];
};
