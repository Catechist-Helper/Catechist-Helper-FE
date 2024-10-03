import { ReactNode, useEffect, useState } from "react";
import { Container, Alert, AlertTitle, Button, Stack } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { LOCALSTORAGE_CONSTANTS } from "../constants/WebsiteConstant";
import { Navigate } from "react-router-dom";

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

  useEffect(() => {
    var userId: any = null;
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
    return <Navigate to={route} />;
  };

  if (!userId) {
    if (accessible != null && accessible == false) {
      return (
        <Container sx={{ height: "100vh" }}>
          <Alert severity="error">
            <AlertTitle>Từ chối truy cập</AlertTitle>
            Bạn không có quyền truy cập trang này
          </Alert>
          <Stack direction="row" justifyContent="center">
            <Button onClick={() => navigateToPage("/")}>
              Quay lại trang chính
            </Button>
            <Button onClick={logout} variant="outlined" color="inherit">
              Đăng xuất
            </Button>
          </Stack>
        </Container>
      );
    }
  }

  if (accessible && isAuthenticated && userId) {
    return <>{children}</>;
  }

  return <></>;
}
