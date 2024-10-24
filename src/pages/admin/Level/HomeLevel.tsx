import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ListAllLevel from "./ListAllLevel";

const HomeLevel: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <ListAllLevel />
      </AdminTemplate>
    </>
  );
};

export default HomeLevel;
