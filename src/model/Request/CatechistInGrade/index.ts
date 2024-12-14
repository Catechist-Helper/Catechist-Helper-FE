// src/model/Request/CatechistInGradeRequest.ts

export type CreateCatechistInGradeRequest = {
  gradeId: string;
  catechistIds: string[];
  mainCatechistId: string;
};

export type ReplaceCatechistInGradeRequest = {
  gradeId: string;
  catechistIds: string[];
};
