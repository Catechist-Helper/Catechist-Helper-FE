import { ReactNode } from "react";
import { Container, Alert, AlertTitle, Button, Stack } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router";

// ----------------------------------------------------------------------

type RoleBasedGuardProp = {
  accessibleRoles: String[];
  children: ReactNode | string;
};

const useCurrentRole = (): String[] => {
  const { user } = useAuth();
  const roles: String[] = [];
  roles.push(user?.role);
  return roles;
};

export default function RoleBasedGuard({
  accessibleRoles,
  children,
}: RoleBasedGuardProp) {
  const currentRole = useCurrentRole();
  // const { logout } = useAuth();
  const navigate = useNavigate();

  if (
    accessibleRoles?.length !== 0 &&
    !accessibleRoles.some((r) => currentRole.some((ur) => ur === r))
  ) {
    return (
      <Container
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "99999",
        }}
      >
        <Alert severity="error">
          <AlertTitle>
            <h1 className="text-center">Từ chối truy cập</h1>
          </AlertTitle>
          <h1>Bạn không có quyền truy cập trang này</h1>
        </Alert>
        <Stack direction="row" justifyContent="center">
          <Button
            className="mx-1 mt-2"
            onClick={() => navigate("/")}
            variant="contained"
            color="error"
            sx={{ fontSize: "1.2rem" }}
          >
            Quay lại trang chính
          </Button>
          {/* <Button
            className="mx-1"
            onClick={() => {
              logout();
            }}
            variant="contained"
            color="error"
          >
            Đăng xuất tài khoản
          </Button> */}
        </Stack>
      </Container>
    );
  }

  return <>{children}</>;
}
