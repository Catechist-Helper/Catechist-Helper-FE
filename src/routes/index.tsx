import { lazy, Suspense } from "react";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
// components
import LoadingScreen from "../components/Organisms/LoadingScreen/LoadingScreen";
// guards
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import RoleBasedGuard from "../guards/RoleBasedGuard";
import { AccountRoleString } from "../enums/Account";
import IdBasedGuard from "../guards/IdBasedGuard";
// path

// ----------------------------------------------------------------------

const Loadable = (Component: any) => (props: any) => {
  const { pathname } = useLocation();

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...{
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9999,
              position: "fixed",
            },
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
      path: "/",
      children: [
        { path: "/", element: <Home /> },
        {
          path: "/login",
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
      ],
    },

    {
      path: "/admin",
      children: [
        {
          path: "/admin",
          element: <AdminLandingPage />,
        },
      ],
    },

    { path: "*", element: <NotFound /> },
  ]);
}

// IMPORT COMPONENTS

const Home = Loadable(lazy(() => import("../pages/common/Home/Home")));

// Authentication
const Login = Loadable(lazy(() => import("../pages/common/Login/Login")));

//404
const NotFound = Loadable(lazy(() => import("../pages/error/BasicErrorPage")));

//Admin
const AdminLandingPage = Loadable(
  lazy(() => import("../pages/admin/AdminLandingPage/index"))
);
