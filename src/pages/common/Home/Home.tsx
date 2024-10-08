import React from "react";
import HomeTemplate from "../../../components/Templates/HomeTemplate/HomeTemplate";
import IntroductionComponent from "./components/IntroductionComponent";
import OutstandingNews from "./components/OutstandingNews";

const Home: React.FC = () => {
  return (
    <>
      <HomeTemplate>
        <IntroductionComponent />
        <OutstandingNews />
      </HomeTemplate>
    </>
  );
};

export default Home;
