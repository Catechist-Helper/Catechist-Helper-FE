import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import CatechistComponent from "./CatechistComponent";

const CatechistManagementAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <CatechistComponent />
      </AdminTemplate>
    </>
  );
};

export default CatechistManagementAdminPage;
