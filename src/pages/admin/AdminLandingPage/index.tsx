import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import HomePost from "./posts/HomePost";

const AdminHome: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <>
        <HomePost/>
        </>
      </AdminTemplate>
    </>
  );
};

export default AdminHome;
