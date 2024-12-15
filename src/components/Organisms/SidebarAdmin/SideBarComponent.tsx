import "./SideBarComponent.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PATH_ADMIN, PATH_HOME } from "../../../routes/paths";
import useAuth from "../../../hooks/useAuth";

const SideBarComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };

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
              {/* Thời gian biểu */}
              <li className="min-w-max">
                <Link
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  to={PATH_ADMIN.admin_calendar}
                  className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                >
                  Thời gian biểu
                </Link>
              </li>

              {/* Tuyển dụng */}
              <li className="min-w-max">
                <div
                  onClick={() => toggleGroup("tuyendung")}
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  className="group-title sidebar-link rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                >
                  Tuyển dụng
                </div>
                {openGroup === "tuyendung" && (
                  <ul className="pl-4 space-y-2">
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.admin_registration}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Ứng tuyển
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.approved_registration}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Phỏng vấn
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Giáo lý */}
              <li className="min-w-max">
                <div
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  className="group-title sidebar-link rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  onClick={() => toggleGroup("giaoly")}
                >
                  Giáo lý
                </div>
                {openGroup === "giaoly" && (
                  <ul className="pl-4 space-y-2">
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.major_management}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Ngành học
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.grade_management}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Khối học
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.class_management}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Lớp học
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.admin_management_absence}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Nghỉ phép
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Quản lý */}
              <li className="min-w-max">
                <div
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  className="group-title sidebar-link rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  onClick={() => toggleGroup("quanly")}
                >
                  Quản lý
                </div>
                {openGroup === "quanly" && (
                  <ul className="pl-4 space-y-2">
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.catechist_management}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Giáo lý viên
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.levels}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Cấp độ
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.rooms}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Phòng học
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.pastoral_years}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Niên khóa
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.christian_name}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Tên Thánh
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.system_configurations}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Thông số
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Đào tạo */}

              <li className="min-w-max">
                <Link
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  to={PATH_ADMIN.training_lists}
                  className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                >
                  Đào tạo
                </Link>
              </li>

              {/* Sự kiện */}
              <li className="min-w-max">
                <div
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  className="group-title sidebar-link rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  onClick={() => toggleGroup("sukien")}
                >
                  Sự kiện
                </div>
                {openGroup === "sukien" && (
                  <ul className="pl-4 space-y-2">
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.admin_event_category_management}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Danh mục sự kiện
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.admin_event_management}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Sự kiện
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Tin tức */}
              <li className="min-w-max">
                <div
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  className="group-title sidebar-link rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  onClick={() => toggleGroup("tintuc")}
                >
                  Tin tức
                </div>
                {openGroup === "tintuc" && (
                  <ul className="pl-4 space-y-2">
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.post_category}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Danh mục tin tức
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_ADMIN.post}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Tin tức
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Khác */}
              <li className="min-w-max">
                <div
                  style={{
                    opacity: `${isHovered ? "1" : "0"}`,
                    transition: "all ease 0.2s",
                  }}
                  className="group-title sidebar-link rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                  onClick={() => toggleGroup("khac")}
                >
                  Khác
                </div>
                {openGroup === "khac" && (
                  <ul className="pl-4 space-y-2">
                    <li className="min-w-max">
                      <Link
                        style={{
                          opacity: `${isHovered ? "1" : "0"}`,
                          transition: "all ease 0.2s",
                        }}
                        to={PATH_HOME.root}
                        className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                      >
                        Trang chủ
                      </Link>
                    </li>
                    <li className="min-w-max">
                      <div onClick={() => console.log("Logout")}>
                        <li
                          style={{
                            opacity: `${isHovered ? "1" : "0"}`,
                            transition: "all ease 0.2s",
                          }}
                          onClick={() => {
                            logout();
                          }}
                          className="sidebar-link relative flex items-center rounded-full space-x-4 text-gray-700 hover:bg-gradient-to-r hover:from-primary_color hover:to-amber-600 px-4 py-3 hover:text-white"
                        >
                          Đăng xuất
                        </li>
                      </div>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBarComponent;
