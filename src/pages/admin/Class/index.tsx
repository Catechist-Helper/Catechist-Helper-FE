import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ClassComponent from "./ClassComponent";

const ClassManagementAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <ClassComponent />
      </AdminTemplate>
    </>
  );
};

export default ClassManagementAdminPage;
