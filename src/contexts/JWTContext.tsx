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
import { PATH_ADMIN, PATH_AUTH, PATH_CATECHIST } from "../routes/paths";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";
// import Swal from "sweetalert2";
import { BasicResponse } from "../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { AccountRoleString } from "../enums/Account";
import catechistApi from "../api/Catechist";
import Swal from "sweetalert2";
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
  const navigate = useNavigate();

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
    localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    navigate(route);
  };

  const login = async (email: string, password: string) => {
    const cateRes = await catechistApi.getAllCatechists(1, 100000);

    try {
      enableLoading();
      await axiosInstances.base
        .post("/login", {
          email,
          password,
        })
        .then((response: AxiosResponse) => {
          const res: BasicResponse = response.data;
          if (
            res.statusCode.toString().trim().startsWith("2") &&
            res.data != null
          ) {
            const { id, email, role, token } = res.data;
            let user: any = {
              id: id,
              email: email,
              role: role,
            };

            if (
              role &&
              role.trim().toLowerCase() ===
                AccountRoleString.CATECHIST.trim().toLowerCase()
            ) {
              let cateId = cateRes.data.data.items.find(
                (item) => item.email == user.email
              )?.id;
              user = { ...user, catechistId: cateId };
            }

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
              navigateToPage(PATH_ADMIN.root);
            } else if (
              role &&
              role.trim().toLowerCase() ===
                AccountRoleString.CATECHIST.trim().toLowerCase()
            ) {
              navigateToPage(PATH_CATECHIST.root);
            } else {
              navigateToPage("/");
            }
            disableLoading();
          } else {
            disableLoading();
            sweetAlert.alertFailed(
              `Đăng nhập thất bại`,
              `Vui lòng kiểm tra email hoặc mật khẩu và đăng nhập lại`,
              5000,
              26
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
          if (getUserInfo() && getUserInfo()?.id) {
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
        `Vui lòng kiểm tra email hoặc mật khẩu và đăng nhập lại`,
        5000,
        26
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
    setTimeout(() => {
      Swal.fire({
        title: "Đăng xuất thành công",
        icon: "success",
        showConfirmButton: false,
        timer: 1000,
      });
    }, 150);
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
