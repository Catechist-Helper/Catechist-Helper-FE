import { ReactNode, useEffect, useState } from "react";
import { Container, Alert, AlertTitle, Button, Stack } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";

type RoleBasedGuardProp = {
  accessibleIds: String[];
  children: ReactNode;
};

export default function IdBasedGuard({
  accessibleIds,
  children,
}: RoleBasedGuardProp) {
  const { isAuthenticated, logout } = useAuth();
  const [accessible, setAccessible] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ending, setEnding] = useState<boolean>(false);

  useEffect(() => {
    var userId: any = null;
    // if (params.userId) {
    //   userId = params.userId as string;
    // }
    if (
      !(
        accessibleIds?.length !== 0 &&
        !accessibleIds.some((r) => r === userId) &&
        isAuthenticated &&
        userId
      )
    ) {
      setAccessible(true);
      setUserId(userId);
    } else {
      setAccessible(false);
      setUserId(userId);
    }
  }, [isAuthenticated]);

  const navigateToPage = (route: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, route);
    }
    // router.push(route);
  };

  if (!userId) {
    if (accessible != null && accessible == false) {
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

  if (accessible && isAuthenticated && userId) {
    return <>{children}</>;
  }

  return <></>;
}
