import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ApprovedRegistrationComponent from "./ApprovedRegistrationComponent";

const RegistrationAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <ApprovedRegistrationComponent />
      </AdminTemplate>
    </>
  );
};

export default RegistrationAdminPage;
