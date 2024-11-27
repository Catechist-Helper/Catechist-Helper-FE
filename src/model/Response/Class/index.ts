// src/model/Response/ClassResponse.ts

export type CatechistResponse = {
  catechist:
  {
  id: string;
  code: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  birthPlace: string;
  address: string;
  phone: string;
  qualification: string;
  isTeaching: boolean;
  account: {
    id: string;
    email: string;
    fullName: string;
    gender: string;
    phone: string;
    avatar: string;
    role: {
      id: string;
      roleName: string;
    };
  };
  christianNameId: string;
  christianName: string;
  levelId: string;
  level: {
    id: string;
    name: string;
    description: string;
    catechismLevel: number;
  };
  imageUrl: string;
  fatherName: string;
  motherName: string;
  note: string;
  email: string;
  levelName: string;
  certificates: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    levelId: string;
  }}
  isMain:boolean
};

export type GetCatechistClassResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: CatechistResponse[];
};

export type ClassResponse = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfCatechist: number;
  note: string;
  classStatus: number;
  pastoralYearId: string;
  pastoralYearName: string;
  gradeId: string;
  gradeName: string;
  majorId: string;
  majorName: string;
};

export type SlotResponse = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  catechistId: string;
  catechist: CatechistResponse;
};

export type GetClassResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: ClassResponse[];
};


export type GetSlotResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: SlotResponse[];
};
