import "./SideBarComponent.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PATH_ADMIN } from "../../../routes/paths";
import useAuth from "../../../hooks/useAuth";

const SideBarComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth();

  return (
    <div
      className="bg-gray-300 z-[999]"
      style={{
        height: "100%",
        overflowY: "auto",
        position: "sticky",
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
                    to={PATH_ADMIN.admin_calendar}
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
                    to={PATH_ADMIN.catechist_management}
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
                      Giáo lý viên
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
                    to={PATH_ADMIN.admin_registration}
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
                    <span className="group-hover:text-gray-700">Ứng tuyển</span>
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
                    to={PATH_ADMIN.approved_registration}
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
                    to={PATH_ADMIN.major_management}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Ngành học</span>
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
                    to={PATH_ADMIN.grade_management}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Khối học</span>
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
                    to={PATH_ADMIN.class_management}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Lớp học</span>
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
                    to={PATH_ADMIN.admin_management_absence}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Nghỉ phép</span>
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
                    to={PATH_ADMIN.rooms}
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
                        fillRule="evenodd"
                        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Phòng học</span>
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
                    to={PATH_ADMIN.levels}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Cấp độ</span>
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
                    to={PATH_ADMIN.pastoral_years}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Niên khóa</span>
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
                    to={PATH_ADMIN.admin_event_category_management}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">
                      Danh mục sự kiện
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
                    to={PATH_ADMIN.admin_event_management}
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
                        fillRule="evenodd"
                        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Sự kiện</span>
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
                    to={PATH_ADMIN.post_category}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">
                      Danh mục tin tức
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
                    to={PATH_ADMIN.post}
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
                        fillRule="evenodd"
                        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Tin tức</span>
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
                    to={PATH_ADMIN.christian_name}
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
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-600 group-hover:text-cyan-600"
                        d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Tên Thánh</span>
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
                    to={PATH_ADMIN.training_lists}
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
                        fillRule="evenodd"
                        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
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
                    to={PATH_ADMIN.system_configurations}
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
                        fillRule="evenodd"
                        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                        clipRule="evenodd"
                      />
                      <path
                        className="fill-current text-gray-300 group-hover:text-cyan-300"
                        d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                      />
                    </svg>
                    <span className="group-hover:text-gray-700">Thông số</span>
                  </Link>
                </div>
              </li>
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

export default SideBarComponent;
