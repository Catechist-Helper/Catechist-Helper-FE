import { ReactNode, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  // const router = useRouter();

  const navigateToPage = (route: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    }
    // router.push(route);
  };

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      navigateToPage("/");
    }
  }, [isAuthenticated, isInitialized]);

  return <>{children}</>;
}
