import { lazy, Suspense } from "react";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
// components
import LoadingScreen from "../components/Organisms/LoadingScreen/LoadingScreen";
// guards
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import RoleBasedGuard from "../guards/RoleBasedGuard";
import { AccountRoleString } from "../enums/accountRole";
import IdBasedGuard from "../guards/IdBasedGuard";
import CreatePostCategory from "../pages/admin/AdminLandingPage/posts/CreatePostCategory";
import PostCategory from "../pages/admin/AdminLandingPage/posts/PostCategory";
import UpdatePostCategory from "../pages/admin/AdminLandingPage/posts/UpdatePostCategory";
import CreatePost from "../pages/admin/AdminLandingPage/posts/CreatePost";
// path

// ----------------------------------------------------------------------

const Loadable = (Component: any) => (props: any) => {
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
        {
          path: "/admin/create-post-category",
          element: <CreatePostCategory />, 
        },
        {
          path: "/admin/post-category",
          element: <PostCategory />, 
        },
        {
          path: "/admin/update-post-category/:id",
          element: <UpdatePostCategory />, 
        },
        {
          path: "/admin/create-post",
          element: <CreatePost />, 
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
