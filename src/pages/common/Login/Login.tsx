import React from "react";
import HomeTemplate from "../../../components/Templates/HomeTemplate/HomeTemplate";
import LoginComponent from "./components/LoginComponent";

const Login: React.FC = () => {
  return (
    <>
      <HomeTemplate>
        <LoginComponent />
      </HomeTemplate>
    </>
  );
};

export default Login;
