import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
// hooks
import useAuth from "../hooks/useAuth";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";
import { AuthUser } from "../types/authentication";
import { getUserInfo } from "../utils/utils";

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const [userLogin, setUserLogin] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user: AuthUser = getUserInfo();
    if (user && user.id) {
      setUserLogin(user);
    }
  }, []);

  if (!isAuthenticated && userLogin && !userLogin.id) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, "/");
    }
    return <Navigate to={"/"} />;
  }

  return <>{children}</>;
}
