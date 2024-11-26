import React from "react";
import CatechistTemplate from "../../../components/Templates/CatechistTemplate/CatechistTemplate";
import CatechistClassComponent from "./CatechistClassComponent";

const CatechistClassPage: React.FC = () => {
  return (
    <>
      <CatechistTemplate>
        <CatechistClassComponent />
      </CatechistTemplate>
    </>
  );
};

export default CatechistClassPage;
