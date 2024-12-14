// src/model/Request/CatechistInClassRequest.ts

export type CreateCatechistInClassRequest = {
  classId: string;
  catechistIds: string[];
  mainCatechistId: string;
};

export type ReplaceCatechistInClassRequest = {
  catechistId: string,
  classId: string,
  replaceCatechistId: string,
  type: number,
  requestId: string
}
