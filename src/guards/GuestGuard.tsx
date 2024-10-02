import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
// hooks
import useAuth from "../hooks/useAuth";
import { PATH_ROOT_HOME } from "../routes/paths";

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={PATH_ROOT_HOME} />;
  }

  return <>{children}</>;
}
