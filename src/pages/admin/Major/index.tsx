import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import MajorComponent from "./MajorComponent";

const MajorManagementAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <MajorComponent />
      </AdminTemplate>
    </>
  );
};

export default MajorManagementAdminPage;
