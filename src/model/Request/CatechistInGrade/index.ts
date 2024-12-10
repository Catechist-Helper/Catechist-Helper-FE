// src/model/Request/CatechistInGradeRequest.ts

export type CreateCatechistInGradeRequest = {
  gradeId: string;
  catechistIds: string[];
  mainCatechistId: string;
};
