import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import EventCategoriesComponent from "./EventCategoriesComponent";

const AdminEventCategoryManagement: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <EventCategoriesComponent />
      </AdminTemplate>
    </>
  );
};

export default AdminEventCategoryManagement;
