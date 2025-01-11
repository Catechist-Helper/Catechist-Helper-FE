import React, { useEffect } from "react";
import HomeTemplate from "../../../components/Templates/HomeTemplate/HomeTemplate";
import IntroductionComponent from "./components/IntroductionComponent";
import OutstandingNews from "./components/OutstandingNews";
import { LOCALSTORAGE_CONSTANTS } from "../../../constants/WebsiteConstant";
import { PATH_HOME } from "../../../routes/paths";

const Home: React.FC = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, PATH_HOME.root);
    }
  }, []);

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
