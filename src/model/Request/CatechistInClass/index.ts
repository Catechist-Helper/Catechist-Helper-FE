// src/model/Request/CatechistInClassRequest.ts

export type CreateCatechistInClassRequest = {
  classId: string;
  catechistIds: string[];
  mainCatechistId: string;
};
