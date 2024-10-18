import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ListAllRoom from "./ListAllRoom";
const RegistrationAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
       <>
       <ListAllRoom />
       </>
      </AdminTemplate>
    </>
  );
};

export default RegistrationAdminPage;
