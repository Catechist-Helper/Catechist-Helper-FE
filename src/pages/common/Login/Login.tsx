import React, { useEffect } from "react";
import HomeTemplate from "../../../components/Templates/HomeTemplate/HomeTemplate";
import LoginComponent from "./components/LoginComponent";
import { LOCALSTORAGE_CONSTANTS } from "../../../constants/WebsiteConstant";
import { PATH_AUTH } from "../../../routes/paths";

const Login: React.FC = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
        PATH_AUTH.login
      );
    }
  }, []);
  return (
    <>
      <HomeTemplate>
        <LoginComponent />
      </HomeTemplate>
    </>
  );
};

export default Login;
