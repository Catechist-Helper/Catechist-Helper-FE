import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ListAllChristianName from "./ListAllChristianName";

const RegistrationAdminPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
       <>
       <ListAllChristianName/>
       </>
      </AdminTemplate>
    </>
  );
};

export default RegistrationAdminPage;
