import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import RegistrationComponent from "./RegistrationComponent";

const RegistrationAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <RegistrationComponent />
      </AdminTemplate>
    </>
  );
};

export default RegistrationAdminPage;
