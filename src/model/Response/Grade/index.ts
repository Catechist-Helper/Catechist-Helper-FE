// src/model/Response/GradeResponse.ts
export type MajorResponse = {
  id: string;
  name: string;
  hierarchyLevel: number;
};

export type PastoralYearResponse = {
  id: string;
  name: string;
  note: string;
  pastoralYearStatus: number;
};

export type GradeResponse = {
  id: string;
  name: string;
  totalCatechist: number;
  major: MajorResponse;
  pastoralYear: PastoralYearResponse;
};

export type GetMajorResponse = {
  size: number,
  page: number,
  total: number,
  totalPages: number,
  items: GradeResponse[];
};
