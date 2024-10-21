// Tạo model request nếu cần truyền dữ liệu ở dạng JSON (trong trường hợp không sử dụng FormData)
// Mô hình này có thể không cần thiết nếu tất cả dữ liệu đều được truyền qua FormData
export type CatechistRequest = {
  code: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  birthPlace: string;
  address: string;
  phone: string;
  qualification: string;
  isTeaching: boolean;
  accountId: string;
  christianNameId: string;
  levelId: string;
  imageUrl: File;  // Đây sẽ là file hình ảnh nếu dùng FormData
  fatherName: string;
  motherName: string;
  note: string;
};
