import React from "react";
import SideBarComponent from "../../Organisms/SidebarAdmin/SideBarComponent";
// import NavBar from "./navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarAdmin from "../../Organisms/NavbarAdmin/NavbarAdmin";
import LoadingScreen from "../../Organisms/LoadingScreen/LoadingScreen";
import useAppContext from "../../../hooks/useAppContext";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAppContext();

  return (
    <>
      <div
        className="w-screen h-screen fixed z-[9999]"
        style={{
          display: `${isLoading ? "block" : "none"}`,
        }}
      >
        <LoadingScreen transparent={true} />
      </div>
      <div className="flex h-full min-h-screen">
        <SideBarComponent />
        <div className="flex flex-col flex-1 min-h-screen">
          <NavbarAdmin />
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
