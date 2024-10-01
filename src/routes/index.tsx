import { lazy, Suspense } from "react";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
// components
import LoadingScreen from "../components/LoadingScreen";
// guards
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import RoleBasedGuard from "../guards/RoleBasedGuard";
// path

// ----------------------------------------------------------------------

const Loadable = (Component: any) => (props: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...(!isDashboard && {
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9999,
              position: "fixed",
            }),
          }}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: "auth",
      children: [
        {
          path: "login",
          element: (
            <GuestGuard>
              {/* Login Page here */}
              <></>
            </GuestGuard>
          ),
        },
      ],
    },

    {
      path: "/",
      element: <Navigate to="/" />,
    },

    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT COMPONENTS

// Authentication
// const Login = Loadable(lazy(() => import("../pages/authentication/Login")));
