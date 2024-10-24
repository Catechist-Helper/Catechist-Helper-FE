import React from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import ListAllTrain from "./ListAllTrain";

const HomeLevel: React.FC = () => {
  return (
    <>
      <AdminTemplate>
        <ListAllTrain />
      </AdminTemplate>
    </>
  );
};

export default HomeLevel;
