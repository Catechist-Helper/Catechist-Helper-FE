export type CreateCatechistRequest = {
    code: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
    birthPlace: string;
    address: string;
    phone: string;
    qualification: string;
    isTeaching: boolean;
    note?: string;
    accountId?: string;
    christianNameId?: string;
    levelId?: string;
    imageUrl?: string;
    fatherName?: string;
    motherName?: string;
    fatherPhone?: string;
    motherPhone?: string;
  };
  