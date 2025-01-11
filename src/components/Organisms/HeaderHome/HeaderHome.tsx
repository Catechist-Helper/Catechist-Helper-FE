import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  PATH_ADMIN,
  PATH_AUTH,
  PATH_HOME,
  PATH_CATECHIST,
} from "../../../routes/paths";
import { getUserInfo } from "../../../utils/utils";
import { AuthUser } from "../../../types/authentication";
import { AccountRoleString } from "../../../enums/Account";
import { LOCALSTORAGE_CONSTANTS } from "../../../constants/WebsiteConstant";
import sweetAlert from "../../../utils/sweetAlert";

const HeaderHome: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [userLogin, setUserLogin] = useState<AuthUser>({});
  useEffect(() => {
    const user: AuthUser = getUserInfo();
    if (user && user.id) {
      setUserLogin(user);
    }
  }, []);

  return (
    <header className="bg-primary_color text-text_primary_light">
      <div className="px-20 py-3 flex flex-row items-center justify-between">
        <Link
          to={"/"}
          style={{ textDecoration: "none" }}
          className="hover:text-text_primary_light"
        >
          <h2
            className="text-[1.5rem] inline-block"
            style={{ fontWeight: "bolder" }}
          >
            Catechist Helper
          </h2>
        </Link>
        <nav
          className="nav_header_home flex gap-x-8"
          style={{ fontWeight: "500" }}
        >
          <Link
            to={"/"}
            className={`links_dark_hover 
            ${
              typeof window !== undefined &&
              localStorage.getItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE) ==
                PATH_HOME.root
                ? "bg-white text-black rounded-[3px]"
                : ""
            }`}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
                  PATH_HOME.root
                );
              }
            }}
          >
            TRANG CHỦ
          </Link>
          <Link
            to={PATH_HOME.introduce}
            className={`links_dark_hover 
            ${
              typeof window !== undefined &&
              localStorage.getItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE) ==
                PATH_HOME.introduce
                ? "bg-white text-black rounded-[3px]"
                : ""
            }`}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
                  PATH_HOME.introduce
                );
              }
            }}
          >
            GIỚI THIỆU
          </Link>
          <Link
            to={PATH_HOME.news}
            className={`links_dark_hover 
            ${
              typeof window !== undefined &&
              localStorage.getItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE) ==
                PATH_HOME.news
                ? "bg-white text-black rounded-[3px]"
                : ""
            }`}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
                  PATH_HOME.news
                );
              }
            }}
          >
            TIN TỨC
          </Link>
          {!isAuthenticated ? (
            <>
              <Link
                to={PATH_AUTH.login}
                className={`links_dark_hover 
                ${
                  typeof window !== undefined &&
                  localStorage.getItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE) ==
                    PATH_AUTH.login
                    ? "bg-white text-black rounded-[3px]"
                    : ""
                }`}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem(
                      LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
                      PATH_AUTH.login
                    );
                  }
                }}
              >
                ĐĂNG NHẬP
              </Link>
            </>
          ) : (
            <></>
          )}
          {isAuthenticated ? (
            <>
              {userLogin &&
              userLogin.role &&
              userLogin.role.trim().toLowerCase() ===
                AccountRoleString.ADMIN.trim().toLowerCase() ? (
                <>
                  <Link
                    to={PATH_ADMIN.root}
                    className={`links_dark_hover`}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem(
                          LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
                          PATH_ADMIN.admin_calendar
                        );
                      }
                    }}
                  >
                    QUẢN LÝ
                  </Link>
                </>
              ) : (
                <></>
              )}
              {userLogin &&
              userLogin.role &&
              userLogin.role.trim().toLowerCase() ===
                AccountRoleString.CATECHIST.trim().toLowerCase() ? (
                <>
                  <Link
                    to={PATH_CATECHIST.root}
                    className={`links_dark_hover`}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem(
                          LOCALSTORAGE_CONSTANTS.CURRENT_PAGE,
                          PATH_CATECHIST.catechist_calendar
                        );
                      }
                    }}
                  >
                    THÔNG TIN
                  </Link>
                </>
              ) : (
                <></>
              )}
              <Link
                to={"/"}
                onClick={() => {
                  const action = async () => {
                    const confirmLogOut = await sweetAlert.confirm(
                      "Bạn có chắc muốn đăng xuất?",
                      "",
                      "Đăng xuất",
                      "Hủy bỏ",
                      "question"
                    );
                    if (confirmLogOut) {
                      logout();
                    }
                  };
                  action();
                }}
                className={`links_dark_hover`}
              >
                ĐĂNG XUẤT
              </Link>
            </>
          ) : (
            <></>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HeaderHome;
