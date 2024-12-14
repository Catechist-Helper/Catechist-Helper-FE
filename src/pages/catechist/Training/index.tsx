import React from "react";
import CatechistTemplate from "../../../components/Templates/CatechistTemplate/CatechistTemplate";
import CatechistTrainingComponent from "./CatechistTrainingComponent";

const CatechistTrainingPage: React.FC = () => {
  return (
    <>
      <CatechistTemplate>
        <CatechistTrainingComponent />
      </CatechistTemplate>
    </>
  );
};

export default CatechistTrainingPage;
