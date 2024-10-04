// src/model/Request/account/CreateAccountRequest.ts
export type CreateAccountRequest = {
    email: string;
    password: string;
    roleId: string;
  };
  
  // src/model/Request/account/UpdateAccountRequest.ts
  export type UpdateAccountRequest = {
    password: string;
  };
  