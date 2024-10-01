import { ReactNode, useEffect, useState } from "react";
import { Container, Alert, AlertTitle, Button, Stack } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";

type RoleBasedGuardProp = {
  accessibleRoles: String[];
  children: ReactNode | string;
};

const useCurrentRole = (): String[] => {
  const { user } = useAuth();
  return user && user.role ? user.role : [];
};

export default function RoleBasedGuard({
  accessibleRoles,
  children,
}: RoleBasedGuardProp) {
  const currentRole = useCurrentRole();
  const { isAuthenticated, logout } = useAuth();
  // const router = useRouter();
  const [accessible, setAccessible] = useState<boolean>(false);
  const [ending, setEnding] = useState<boolean>(false);

  useEffect(() => {
    if (
      !(
        accessibleRoles?.length !== 0 &&
        !accessibleRoles.some((r) => currentRole.some((ur) => ur === r))
      )
    ) {
      setAccessible(true);
      setEnding(true);
    }
  }, [isAuthenticated]);

  const navigateToPage = (route: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    }
    // router.push(route);
  };

  if (isAuthenticated && ending) {
    if (!accessible) {
      return (
        <div
          style={{ height: "100vh", width: "100vw", margin: "auto" }}
          className="flex items-center justify-center"
        >
          <Container>
            <Alert severity="error" className="flex justify-center">
              <AlertTitle>Permission Denied</AlertTitle>
              You do not have permission to access this page
            </Alert>
            <Stack direction="row" justifyContent="center">
              <Button
                onClick={() => navigateToPage("/")}
                variant="outlined"
                style={{ margin: "0 5px" }}
              >
                Back to home
              </Button>
              <Button
                onClick={logout}
                variant="outlined"
                color="inherit"
                style={{ margin: "0 5px" }}
              >
                Logout
              </Button>
            </Stack>
          </Container>
        </div>
      );
    }
  }

  if (accessible && isAuthenticated) {
    return <>{children}</>;
  }

  return <></>;
}
