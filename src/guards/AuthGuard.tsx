import { useState, ReactNode, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  // const router = useRouter();
  // const pathname = usePathname();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(
    null
  );

  const navigateToPage = (route: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    }
    // router.push(route);
  };

  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      navigateToPage("/");
    }
  }, [isAuthenticated, isInitialized
    // , pathname
    , requestedLocation]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <></>;
}
