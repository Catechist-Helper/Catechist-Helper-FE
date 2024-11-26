import React from "react";
import CatechistTemplate from "../../../components/Templates/CatechistTemplate/CatechistTemplate";
import CatechistRegistrationComponent from "./CatechistRegistrationComponent";

const CatechistInterViewPage: React.FC = () => {
  return (
    <>
      <CatechistTemplate>
        <CatechistRegistrationComponent />
      </CatechistTemplate>
    </>
  );
};

export default CatechistInterViewPage;
