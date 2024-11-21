import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import FileManagementComponent from "./FileManagementComponent.tsx";

const AdminFileManagement: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <FileManagementComponent />
      </AdminTemplate>
    </>
  );
};

export default AdminFileManagement;
