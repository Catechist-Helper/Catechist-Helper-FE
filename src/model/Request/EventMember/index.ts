export interface UpdateMemberRequest {
  id: string;
  roleEventId: string;
}

export interface UpdateMemberOfProcessRequest {
  id: string;
  isMain: boolean;
}
