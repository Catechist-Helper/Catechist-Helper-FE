import React from "react";
import CatechistTemplate from "../../../components/Templates/CatechistTemplate/CatechistTemplate";
import EventsComponent from "./EventsComponent";

const CatechistEventPage: React.FC = () => {
  return (
    <>
      <CatechistTemplate>
        <EventsComponent />
      </CatechistTemplate>
    </>
  );
};

export default CatechistEventPage;
