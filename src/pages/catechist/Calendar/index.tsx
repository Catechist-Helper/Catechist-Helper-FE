import React from "react";
import CatechistTemplate from "../../../components/Templates/CatechistTemplate/CatechistTemplate";
import CatechistCalendarComponent from "./CatechistCalendarComponent";

const AdminCalendar: React.FC = () => {
  return (
    <>
      <CatechistTemplate>
        <CatechistCalendarComponent />
      </CatechistTemplate>
    </>
  );
};

export default AdminCalendar;
