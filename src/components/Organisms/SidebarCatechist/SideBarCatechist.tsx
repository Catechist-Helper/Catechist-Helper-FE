import "./SideBarCatechist.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PATH_CATECHIST } from "../../../routes/paths";
import useAuth from "../../../hooks/useAuth";

const SideBarCatechist = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth();

  return (
    <div
      className="bg-gray-300 z-[999]"
      style={{
        height: "100%",
        overflowY: "auto",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        className="sidebar h-full w-[3.8rem] overflow-hidden border-r hover:w-56 hover:bg-white hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ height: "100%" }}
      >
        <div
          className="flex h-screen flex-col justify-between pt-2 pb-6"
          style={{
            overflowY: `${isHovered ? "scroll" : "hidden"}`,
            overflowX: "hidden",
          }}
        >
          <div>
            <div className={`w-max p-2.5 ${isHovered ? "block" : "hidden"}`}>
              <img
                src="/Icons/logo.png"
                className="w-32 logo"
                alt=""
                style={{ width: "12rem", marginLeft: "5px" }}
              />
            </div>
            <ul className="mt-6 space-y-2 tracking-wide">
              <li className="min-w-max">
                <div>
                  <Link
                    style={{
                      opacity: `${isHovered ? "1" : "0"}`,
                      transition: "all ease 0.2s",
                    }}
                    to={PATH_CATECHIST.catechist_calendar}
                    className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  >
                    <svg
                      style={{ display: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">
                      Thời gian biểu
                    </span>
                  </Link>
                </div>
              </li>
              <li className="min-w-max">
                <div>
                  <Link
                    style={{
                      opacity: `${isHovered ? "1" : "0"}`,
                      transition: "all ease 0.2s",
                    }}
                    to={PATH_CATECHIST.class}
                    className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  >
                    <svg
                      style={{ display: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">
                      Lớp giáo lý
                    </span>
                  </Link>
                </div>
              </li>
              <li className="min-w-max">
                <div>
                  <Link
                    style={{
                      opacity: `${isHovered ? "1" : "0"}`,
                      transition: "all ease 0.2s",
                    }}
                    to={PATH_CATECHIST.interview}
                    className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  >
                    <svg
                      style={{ display: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Phỏng vấn</span>
                  </Link>
                </div>
              </li>
              <li className="min-w-max">
                <div>
                  <Link
                    style={{
                      opacity: `${isHovered ? "1" : "0"}`,
                      transition: "all ease 0.2s",
                    }}
                    to={PATH_CATECHIST.catechist_training}
                    className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  >
                    <svg
                      style={{ display: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Đào tạo</span>
                  </Link>
                </div>
              </li>
              <li className="min-w-max">
                <div>
                  <Link
                    style={{
                      opacity: `${isHovered ? "1" : "0"}`,
                      transition: "all ease 0.2s",
                    }}
                    to={PATH_CATECHIST.event}
                    className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  >
                    <svg
                      style={{ display: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Sự kiện</span>
                  </Link>
                </div>
              </li>
              {/* ------------------------------------ */}
              <li className="min-w-max">
                <Link
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  to={"/"}
                  className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                >
                  <svg
                    style={{ display: "none" }}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      className="fill-current text-gray-300 group-hover:text-cyan-300"
                      d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
                    />
                    <path
                      className="fill-current text-gray-600 group-hover:text-cyan-600"
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="group-hover:text-gray-700">Trang chủ</span>
                </Link>
              </li>
              <li className="min-w-max cursor-pointer">
                <div
                  onClick={() => {
                    logout();
                  }}
                >
                  <Link
                    style={{
                      opacity: `${isHovered ? "1" : "0"}`,
                      transition: "all ease 0.2s",
                    }}
                    to={"/"}
                    className="relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  >
                    <svg
                      style={{ display: "none" }}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Đăng xuất</span>
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBarCatechist;
