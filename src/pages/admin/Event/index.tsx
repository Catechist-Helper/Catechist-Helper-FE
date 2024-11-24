import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import EventsComponent from "./EventsComponent";

const AdminEventManagement: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <EventsComponent />
      </AdminTemplate>
    </>
  );
};

export default AdminEventManagement;
