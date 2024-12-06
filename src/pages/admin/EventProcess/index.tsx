import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import EventProcessManagement from "./EventProcessManagement";

const CatechistEventProcessPage: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <EventProcessManagement />
      </AdminTemplate>
    </>
  );
};

export default CatechistEventProcessPage;
