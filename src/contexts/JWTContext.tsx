import { createContext, ReactNode, useEffect, useReducer } from "react";
// utils
import axiosInstances from "../config/axios";
import { isValidToken, setSession } from "../utils/jwt";
import { getUserInfo, setUserInfo } from "../utils/utils";
import sweetAlert from "../utils/sweetAlert";
// @types
import {
  ActionMap,
  AuthState,
  AuthUser,
  JWTContextType,
} from "../types/authentication";
import { AccountRoleCode, checkRoleCode } from "../enums/accountRole";
import useAppContext from "../hooks/useAppContext";
import { PATH_AUTH } from "../routes/paths";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";
import Swal from "sweetalert2";
import { ResponseDTO } from "../types/responseDTO";
// import authApi from "@/api/auth/authApi";

// ----------------------------------------------------------------------

enum Types {
  Initial = "INITIALIZE",
  Login = "LOGIN",
  Logout = "LOGOUT",
  Register = "REGISTER",
  ChangeUser = "CHANGE_USER",
}

type JWTAuthPayload = {
  [Types.Initial]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [Types.Login]: {
    user: AuthUser;
  };
  [Types.Logout]: undefined;
  [Types.Register]: {
    user: AuthUser;
  };
  [Types.ChangeUser]: {
    user: AuthUser;
  };
};

export type JWTActions =
  ActionMap<JWTAuthPayload>[keyof ActionMap<JWTAuthPayload>];

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const JWTReducer = (state: AuthState, action: JWTActions) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case "LOGIN":
      setUserInfo(action.payload.user);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    case "REGISTER":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };

    case "CHANGE_USER":
      setUserInfo(action.payload.user);
      return {
        ...state,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<JWTContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  // const router = useRouter();
  const [state, dispatch] = useReducer(JWTReducer, initialState);
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        const userRaw = getUserInfo();
        if (accessToken && isValidToken(accessToken) && userRaw) {
          setSession(accessToken);

          const user = JSON.parse(userRaw);

          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          if (accessToken && !isValidToken(accessToken)) {
            logout();
            sweetAlert.alertInfo(
              "Phiên đăng nhập hết hạn",
              "Xin vui lòng đăng nhập lại",
              3000,
              25
            );
          }

          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: Types.Initial,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const navigateToPage = (route: string) => {
    localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    // router.push(route);
  };

  const login = async (username: string, password: string) => {
    try {
      enableLoading();
      await axiosInstances.auth
        .post("/auth/login", {
          username,
          password,
        })
        .then((response) => {
          if (
            response.data.isSuccess &&
            response.data.result != null &&
            response.data.result.user != null
          ) {
            const { id, name, email, phoneNumber, role, address } =
              response.data.result.user;

            var userRole: string[] = [];
            userRole.push(checkRoleCode(role));

            const user = {
              id: id,
              name: name,
              email: email,
              phoneNumber: phoneNumber,
              role: userRole,
              // address: address,
            };

            const accessToken = response.data.result.token;

            setSession(accessToken);
            setUserInfo(user);

            dispatch({
              type: Types.Login,
              payload: {
                user,
              },
            });
            navigateToPage("/");
            disableLoading();
          } else {
            disableLoading();
            sweetAlert.alertFailed(
              `Đăng nhập thất bại`,
              `Xin bạn vui lòng kiểm tra email hoặc mật khẩu và đăng nhập lại`,
              5000,
              30
            );
          }
        })
        .catch((error) => {
          console.log(error);
          disableLoading();
          sweetAlert.alertFailed(
            `Đăng nhập thất bại`,
            `Xin bạn vui lòng kiểm tra email hoặc mật khẩu và đăng nhập lại`,
            5000,
            30
          );
          navigateToPage(PATH_AUTH.login);
        })
        .finally(() => {
          if (getUserInfo()) {
            setTimeout(() => {
              sweetAlert.alertSuccess("Đăng nhập thành công", "", 1200, 22);
            }, 200);
          }
        });
    } catch (error) {
      console.log(error);
      disableLoading();
      sweetAlert.alertFailed(
        `Đăng nhập thất bại`,
        `Xin bạn vui lòng kiểm tra email hoặc mật khẩu và đăng nhập lại`,
        5000,
        30
      );
      navigateToPage(PATH_AUTH.login);
    }
  };

  const loginWithEmail = async (email: string) => {
    try {
      enableLoading();
      await axiosInstances.auth
        .post("/auth/LoginGoogle", email)
        .then((response) => {
          if (
            response.data.isSuccess &&
            response.data.result != null &&
            response.data.result.user != null
          ) {
            const { id, name, email, phoneNumber, role } =
              response.data.result.user;

            var userRole: string[] = [];
            userRole.push(checkRoleCode(role));

            const user = {
              id: id,
              name: name,
              email: email,
              phoneNumber: phoneNumber,
              role: userRole,
            };

            const accessToken = response.data.result.token;

            setSession(accessToken);
            setUserInfo(user);

            dispatch({
              type: Types.Login,
              payload: {
                user,
              },
            });
            navigateToPage("/");
            disableLoading();
          } else {
            disableLoading();
            sweetAlert.alertFailed(
              `Đăng nhập thất bại`,
              `Email này hiện chưa được đăng ký`,
              2000,
              28
            );
          }
        })
        .catch((error) => {
          console.log(error);
          disableLoading();
          sweetAlert.alertFailed(
            `Đăng nhập thất bại`,
            `Email này hiện chưa được đăng ký`,
            2000,
            28
          );
        })
        .finally(() => {
          if (getUserInfo()) {
            setTimeout(() => {
              sweetAlert.alertSuccess("Đăng nhập thành công", "", 1200, 22);
            }, 200);
          }
        });
    } catch (error) {
      console.log(error);
      disableLoading();
      sweetAlert.alertFailed(
        `Đăng nhập thất bại`,
        `Xin bạn vui lòng kiểm tra email hoặc mật khẩu và đăng nhập lại`,
        5000,
        30
      );
      navigateToPage(PATH_AUTH.login);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
    role: string
    // address: string
  ) => {
    enableLoading();

    await axiosInstances.auth
      .post("/auth/register", {
        email: email,
        password: password,
        name: name,
        phoneNumber: phoneNumber,
        role: role,
        // address,
      })
      .then((response) => {
        disableLoading();
        var res: ResponseDTO = response.data;
        if (res.isSuccess) {
        }
        if (!res.isSuccess) {
          if (res.message && res.message.toLowerCase().includes("duplicate")) {
            Swal.fire({
              title: `Email này đã được sử dụng để đăng ký tài khoản`,
              icon: "info",
              showCancelButton: false,
              showConfirmButton: true,
              confirmButtonText: "Tôi đã rõ",
              allowOutsideClick: false,
              focusConfirm: true,
              confirmButtonColor: "#3085d6",
              showCloseButton: true,
            });
          } else {
            Swal.fire({
              title: `Đã xảy ra lỗi gì đó`,
              html: "Xin bạn vui lòng thử lại.",
              icon: "info",
              showCancelButton: false,
              showConfirmButton: true,
              confirmButtonText: "Xác nhận",
              allowOutsideClick: false,
              focusConfirm: true,
              confirmButtonColor: "#3085d6",
              showCloseButton: true,
            });
          }
        }
      })
      .catch((err) => {
        disableLoading();
        Swal.fire({
          title: `Đã xảy ra lỗi gì đó`,
          html: "Xin bạn vui lòng thử lại.",
          icon: "info",
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: "Xác nhận",
          allowOutsideClick: false,
          focusConfirm: true,
          confirmButtonColor: "#3085d6",
          showCloseButton: true,
        });
      });
  };

  const logout = async () => {
    setSession(null);
    setUserInfo({});
    localStorage.removeItem("USER_INFO");
    dispatch({ type: Types.Logout });
    navigateToPage("/");
  };

  const resetPassword = (email: string) => {};

  const updateProfile = () => {};

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        login,
        loginWithEmail,
        logout,
        register,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
