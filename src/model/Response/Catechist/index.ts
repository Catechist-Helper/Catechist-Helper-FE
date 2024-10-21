// Mô hình cho cấp độ giáo lý (level)
export type LevelResponse = {
  id: string;
  name: string;
  description: string;
  catechismLevel: number;
};

// Mô hình cho role của account
export type RoleResponse = {
  id: string;
  roleName: string;
};

// Mô hình cho account của catechist
export type AccountResponse = {
  id: string;
  email: string;
  fullName: string;
  gender: string;
  phone: string;
  avatar: string;
  role: RoleResponse;
};

// Mô hình cho certificate của catechist
export type CertificateResponse = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  levelId: string;
};

// Mô hình cho chi tiết một catechist
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
  account: AccountResponse;
  christianNameId: string;
  christianName: string;
  levelId: string;
  level: LevelResponse;
  imageUrl: string;
  fatherName: string;
  motherName: string;
  note: string;
  email: string;
  levelName: string;
  certificates: CertificateResponse[];
};

// Mô hình cho phản hồi danh sách Catechists (hỗ trợ phân trang)
export type CatechistResponse = {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: CatechistItemResponse[];
};
