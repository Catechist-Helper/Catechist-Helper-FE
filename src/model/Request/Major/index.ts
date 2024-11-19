// src/model/Request/MajorRequest.ts

export type CreateMajorRequest = {
  name: string;
  hierarchyLevel: number
};

export type UpdateMajorRequest = {
  name: string;
};
