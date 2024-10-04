export type BasicResponse<T = any> = {
    statusCode: number;
    message: string | null;
    data: T;
};
  