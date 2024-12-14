import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import AdminCalendarComponent from "./AdminCalendarComponent";

const AdminCalendar: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <AdminCalendarComponent />
      </AdminTemplate>
    </>
  );
};

export default AdminCalendar;
