import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import AbsenceRequestComponent from "./AbsenceRequestComponent";

const AbsenceRequestAdmin: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <AbsenceRequestComponent />
      </AdminTemplate>
    </>
  );
};

export default AbsenceRequestAdmin;
