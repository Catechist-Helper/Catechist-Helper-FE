// src/model/Response/MajorResponse.ts

export type CatechistResponse = {
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
  }[];
};

export type MajorResponse = {
  id: string;
  name: string;
};

export type LevelResponse = {
  id: string;
  name: string;
  description: string;
  catechismLevel: number;
};

export type GetMajorResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: MajorResponse[];
};

export type GetCatechistResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: CatechistResponse[];
};