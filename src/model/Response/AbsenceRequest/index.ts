// Response chung từ backend
export interface AbsenceResponse<T = any> {
  statusCode: number;
  message: string | null;
  data: T;
}
