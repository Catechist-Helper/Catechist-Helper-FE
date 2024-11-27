import React from "react";
import CatechistTemplate from "../../../components/Templates/CatechistTemplate/CatechistTemplate";
import EventProcessManagement from "./EventProcessManagement";

const CatechistEventProcessPage: React.FC = () => {
  return (
    <>
      <CatechistTemplate>
        <EventProcessManagement />
      </CatechistTemplate>
    </>
  );
};

export default CatechistEventProcessPage;
