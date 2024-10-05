"use client";
import React, { useEffect, useState } from "react";
import "./NavbarAdmin.scss";
import Search from "antd/es/input/Search";

import { LOCALSTORAGE_CONSTANTS } from "../../../constants/WebsiteConstant";
import Swal from "sweetalert2";

const NavbarAdmin = () => {
  // State for managing the visibility of the user profile menu
  const [isUserProfileMenuOpen, setUserProfileMenuOpen] = useState(false);

  const navigateTo = (route: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    }
    // router.push(route);
  };

  // Function to toggle the user profile menu
  const toggleUserProfileMenu = () => {
    setUserProfileMenuOpen(!isUserProfileMenuOpen);
  };

  return (
    <nav className="flex-grow-0 justify-between px-10 py-2 items-center bg-white">
      <div className="text-black flex items-center">
        <div className="flex items-center">
          <h1
            className="header_component_title font-baloo mq900:text-[1.5rem] text-[2.15rem]"
            style={{ fontWeight: "bolder" }}
          >
            Catechist Helper
          </h1>
        </div>
        <div className="ml-auto">
          <ul className="flex items-center space-x-6 justify-end">
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#000"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4ZM20 8L12 13L4 8"
                />
              </svg>
            </li>
            <div className="text-black user-profile flex">
              <div style={{ marginRight: "0.5rem", textAlign: "right" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ fontWeight: "600" }}>Admin</li>
                  <li>Role: Admin</li>
                </ul>
              </div>
              {/* Profile Picture */}
              <img
                src="https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=1605"
                alt="User"
              />
              {/* User Profile Menu Dropdown */}
              {isUserProfileMenuOpen && (
                <div
                  className="dropdown-menu text-black hover:bg-black hover:text-white border-black border-[2px] border-solid"
                  style={{ zIndex: "999" }}
                  onClick={() => {
                    Swal.fire({
                      title: "Bạn có chắc muốn đăng xuất?",
                      icon: "info",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Đăng xuất",
                      cancelButtonText: "Hủy bỏ",
                      focusConfirm: false,
                      focusDeny: true,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        // logout();
                        setTimeout(() => {
                          Swal.fire({
                            title: "Đăng xuất thành công",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1000,
                          });
                        }, 300);
                      }
                    });
                  }}
                >
                  <ul>
                    {/* <li>Username</li>
                    <li>User Role</li>
                    <li>Settings</li> */}
                    <li>
                      <div
                        className="px-[5px] text-[1.3rem] font-baloo-2 cursor-pointer flex flex-row items-center justify-end"
                        style={{ fontWeight: "600" }}
                      >
                        Đăng xuất
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              <li
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: "0.5rem",
                }}
                onClick={toggleUserProfileMenu}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#000"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M6 8L12 14L18 8"
                  />
                </svg>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
