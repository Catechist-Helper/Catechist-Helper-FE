import React from "react";
import SideBarComponent from "../../Organisms/SidebarAdmin/SideBarComponent";
// import NavBar from "./navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarAdmin from "../../Organisms/NavbarAdmin/NavbarAdmin";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
