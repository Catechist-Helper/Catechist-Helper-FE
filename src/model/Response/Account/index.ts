// src/model/Response/account/AccountResponse.ts
export type RoleInAccountResponse = {
    id: string;
    roleName: string;
  };
  
export type AccountItemResponse = {
    id: string;
    email: string;
    role: RoleInAccountResponse;
  };
  
export type AccountResponse = {
    size: number,
    page: number,
    total: number,
    totalPages: number,
    items: AccountItemResponse[];
  };
  