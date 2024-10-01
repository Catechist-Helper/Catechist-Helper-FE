export enum AccountRoleCode {
    SUPER_ADMIN = "tTjEu2THQ4ByaQw",
    WAREHOUSE_MANAGER = "1wtugVFlv02cSXe",
    ECONOMIC_LEAD = "rYYN11bgVaSOUgX",
    MEMBER = "cNzPg1zavfka4sg",
    CUSTOMER = "He1IvaUw5je5FPk",
    ANYNOMOUS = "I3IUW7v9SjYkXxY",
}
 
 export enum AccountRoleString {
    SUPER_ADMIN = "MPVI_SUPER_ADMIN",
    WAREHOUSE_MANAGER = "MPVI_WAREHOUSE_MANAGER",
    ECONOMIC_LEAD = "MPVI_ECONOMIC_LEAD",
    MEMBER = "MPVI_MEMBER",
    CUSTOMER = "MPVI_CUSTOMER",
 }
 
 export const checkRoleCode = (role: any) => {
    switch(role) {
       case AccountRoleString.SUPER_ADMIN:
          return AccountRoleCode.SUPER_ADMIN;
       case AccountRoleString.WAREHOUSE_MANAGER:
          return AccountRoleCode.WAREHOUSE_MANAGER;
       case AccountRoleString.ECONOMIC_LEAD:
          return AccountRoleCode.ECONOMIC_LEAD;
       case AccountRoleString.MEMBER:
          return AccountRoleCode.MEMBER;
       case AccountRoleString.CUSTOMER:
          return AccountRoleCode.CUSTOMER;
       default:
       return AccountRoleCode.ANYNOMOUS
    }
 }
 