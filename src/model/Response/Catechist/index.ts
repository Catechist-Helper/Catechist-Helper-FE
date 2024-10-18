export type CatechistItemResponse = {
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
    christianName?: string;
    level?: string;
    imageUrl?: string;
    fatherName?: string;
    motherName?: string;
    note?: string;
    email?: string;
  };
  
  export type CatechistResponse = {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: CatechistItemResponse[];
  };
  