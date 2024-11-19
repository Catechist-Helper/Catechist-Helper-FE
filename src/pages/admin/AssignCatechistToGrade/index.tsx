import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import AssignCatechistToGradeComponent from "./AssignCatechistToGradeComponent";

const AssignCatechistToGradeAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <AssignCatechistToGradeComponent />
      </AdminTemplate>
    </>
  );
};

export default AssignCatechistToGradeAdminPage;
