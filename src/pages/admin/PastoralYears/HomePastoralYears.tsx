import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ListAllPastoralYears from "./ListAllPastoralYears";

const HomePastoralYears: React.FC = () => {
  return (
    <>
      <AdminTemplate>
       <>
       <ListAllPastoralYears/>
       </>
      </AdminTemplate>
    </>
  );
};

export default HomePastoralYears;
