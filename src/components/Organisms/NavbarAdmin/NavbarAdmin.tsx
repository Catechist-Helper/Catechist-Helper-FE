import ReactDOM from "react-dom";
import useAuth from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { AuthUser } from "../../../types/authentication";
import { getUserInfo } from "../../../utils/utils";
import accountApi from "../../../api/Account";
import useAppContext from "../../../hooks/useAppContext";
import sweetAlert from "../../../utils/sweetAlert";

const NavbarAdmin = () => {
  const [isUserProfileMenuOpen, setUserProfileMenuOpen] = useState(false);
  const [userLogin, setUserLogin] = useState<AuthUser>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { logout } = useAuth();

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

  const toggleUserProfileMenu = () => {
    setUserProfileMenuOpen(!isUserProfileMenuOpen);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  // Dropdown Menu Component with Portal
  const UserMenuDropdown = () =>
    ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          top: "60px", // Điều chỉnh vị trí
          right: "20px",
          zIndex: 9999, // Cực cao
          backgroundColor: "#fff",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          onClick={() => {
            toggleUserProfileMenu();
            setDialogOpen(true);
          }}
          className="px-4 py-2 text-black cursor-pointer hover:bg-gray-200"
        >
          Đổi mật khẩu
        </div>
        <div
          onClick={() => {
            toggleUserProfileMenu();
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
          className="px-4 py-2 text-black cursor-pointer hover:bg-gray-200"
        >
          Đăng xuất
        </div>
      </div>,
      document.body
    );

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
    <nav
      className="flex-grow-0 justify-between px-10 py-2 items-center bg-white"
      style={{ width: "calc(100% - 3.8rem)", transform: "translateX(3.7rem)" }}
    >
      <div className="text-black flex items-center">
        <h1 className="header_component_title font-baloo text-[2.15rem] font-bold">
          Catechist Helper
        </h1>

        {/* User Profile */}
        <div className="ml-auto flex items-center relative">
          <div className="mr-2">
            <span className="font-semibold">{userLogin?.email || ""}</span>
            <div className="text-end">Vai trò: Admin</div>
          </div>
          <div onClick={toggleUserProfileMenu} className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 8L12 14L18 8"
              />
            </svg>
          </div>

          {/* Dropdown Portal */}
          {isUserProfileMenuOpen && <UserMenuDropdown />}
        </div>
      </div>
      {isDialogOpen ? (
        <>
          <ChangePasswordDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            onSubmit={handleChangePassword}
          />
        </>
      ) : (
        <></>
      )}
    </nav>
  );
};

export default NavbarAdmin;
