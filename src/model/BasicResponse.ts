export type BasicResponse = {
    statusCode: number,
    message: string | null,
    data: any,
    [key: string]: any;
}