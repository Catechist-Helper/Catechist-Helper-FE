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
import useAppContext from "../hooks/useAppContext";
import { PATH_ADMIN, PATH_AUTH } from "../routes/paths";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";
// import Swal from "sweetalert2";
import { BasicResponse } from "../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { AccountRoleString } from "../enums/Account";
// import authApi from "@/api/auth/authApi";

// ----------------------------------------------------------------------

enum Types {
  Initial = "INITIALIZE",
  Login = "LOGIN",
  Logout = "LOGOUT",
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

          const user = userRaw;

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
    const navigate = useNavigate();
    localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    navigate(route);
  };

  const login = async (email: string, password: string) => {
    try {
      enableLoading();
      await axiosInstances.base
        .post("/login", {
          email,
          password,
        })
        .then((response: AxiosResponse) => {
          console.log(response);

          const res: BasicResponse = response.data;
          if (
            res.statusCode.toString().trim().startsWith("2") &&
            res.data != null
          ) {
            const { id, email, role, token } = res.data;
            const user = {
              id: id,
              email: email,
              role: role,
            };

            setSession(token);
            setUserInfo(user);

            dispatch({
              type: Types.Login,
              payload: {
                user,
              },
            });

            if (
              role &&
              role.trim().toLowerCase() ===
                AccountRoleString.ADMIN.trim().toLowerCase()
            ) {
              setTimeout(() => {
                navigateToPage(PATH_ADMIN.root);
              }, 5000);
            } else {
              navigateToPage("/");
            }
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

  const logout = async () => {
    setSession(null);
    setUserInfo({});
    localStorage.removeItem("USER_INFO");
    dispatch({ type: Types.Logout });
    navigateToPage("/");
  };

  // const resetPassword = () => {};

  const updateProfile = () => {};

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        login,
        logout,
        // resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
