import { useState, useEffect } from "react";
import "./NavbarAdmin.scss";
//import Search from "antd/es/input/Search";
import Swal from "sweetalert2";
import { getUserInfo } from "../../../utils/utils";
import useAuth from "../../../hooks/useAuth";
import ChangePasswordDialog from "../NavbarAdmin/ChangePasswordDialog";
import useAppContext from "../../../hooks/useAppContext";
import accountApi from "../../../api/Account";
import { AuthUser } from "../../../types/authentication";
import sweetAlert from "../../../utils/sweetAlert";

const NavbarAdmin = () => {
  // State for managing the visibility of the user profile menu
  const [isUserProfileMenuOpen, setUserProfileMenuOpen] = useState(false);
  const [userLogin, setUserLogin] = useState<AuthUser>(null);
  const { logout } = useAuth();

  // Function to toggle the user profile menu
  const toggleUserProfileMenu = () => {
    setUserProfileMenuOpen(!isUserProfileMenuOpen);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userLoggedin = getUserInfo();
        setUserLogin(userLoggedin);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, []);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Open Change Password Dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // Close Change Password Dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const { enableLoading, disableLoading } = useAppContext();
  // Handle password change submit
  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      enableLoading();
      await accountApi.updatePassword({
        email: userLogin && userLogin.email ? userLogin.email : "",
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      sweetAlert.alertSuccess("Đổi mật khẩu thành công", "", 5000, 25);
      toggleUserProfileMenu();

      setDialogOpen(false);
    } catch (error: any) {
      console.log(error);
      if (
        (error.message && error.message.includes("Password không đúng")) ||
        (error.Error && error.Error.includes("Password không đúng"))
      ) {
        sweetAlert.alertFailed("Mật khẩu hiện tại không đúng", "", 5000, 25);
      } else {
        sweetAlert.alertFailed("Có lỗi xảy ra khi đổi mật khẩu", "", 1000, 22);
      }
    } finally {
      disableLoading();
    }
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
              {/* <svg
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
              </svg> */}
            </li>
            <div className="text-black user-profile flex">
              <div style={{ marginRight: "0.5rem", textAlign: "right" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ fontWeight: "600" }}>
                    {userLogin && userLogin.email ? userLogin.email : ""}
                  </li>
                  <li>Vai trò: Giáo lý viên</li>
                </ul>
              </div>
              {/* Profile Picture */}
              {/* <img
                src="https://wac-cdn.atlassian.com/dam/jcr:ba03a215-2f45-40f5-8540-b2015223c918/Max-R_Headshot%20(1).jpg?cdnVersion=1605"
                alt="User"
              /> */}
              {/* User Profile Menu Dropdown */}
              {isUserProfileMenuOpen ? (
                <div
                  style={{
                    zIndex: "999",
                    position: "absolute",
                    top: "50px",
                    right: "0",
                  }}
                >
                  <div
                    onClick={() => {
                      handleOpenDialog();
                    }}
                    className=" px-2 py-1 border-b-2 border-b-white text-[1rem] cursor-pointer bg-black text-white"
                    style={{
                      fontWeight: "600",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                    }}
                  >
                    Đổi mật khẩu
                  </div>
                  <ChangePasswordDialog
                    open={isDialogOpen}
                    onClose={handleCloseDialog}
                    onSubmit={handleChangePassword}
                  />
                  <div
                    onClick={() => {
                      Swal.fire({
                        title: "Bạn có chắc muốn đăng xuất?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Đăng xuất",
                        cancelButtonText: "Hủy bỏ",
                        focusConfirm: false,
                        focusDeny: true,
                      }).then((result) => {
                        if (result.isConfirmed) {
                          logout();
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
                    className="px-2 py-1 border-b-2 border-b-white text-[1rem] cursor-pointer bg-black text-white"
                    style={{
                      fontWeight: "600",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                    }}
                  >
                    Đăng xuất
                  </div>
                </div>
              ) : (
                <></>
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
