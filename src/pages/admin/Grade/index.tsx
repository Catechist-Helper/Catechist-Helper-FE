import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import GradeComponent from "./GradeComponent";

const GradeManagementAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <GradeComponent />
      </AdminTemplate>
    </>
  );
};

export default GradeManagementAdminPage;
