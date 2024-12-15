export interface GetLeaveRequestItemResponse 
{
  id: string,
  reason: string,
  comment: string | null,
  approvalDate: string | null,
  catechistId: string,
  catechistName: string,
  approver: any,
  status: number,
  approverId:  string | null,
  createAt: string,
  updateAt:  string | null,
  leaveDate: string | null
}