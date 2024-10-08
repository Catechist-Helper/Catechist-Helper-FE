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
import CreatePostCategory from "../pages/admin/posts/CreatePostCategory";
import PostCategory from "../pages/admin/posts/PostCategory";
import UpdatePostCategory from "../pages/admin/posts/UpdatePostCategory";
import CreatePost from "../pages/admin/posts/CreatePost";
import { PATH_ADMIN } from "./paths";
import PostDetails from "../pages/admin/posts/PostDetails";
import UpdatePost from "../pages/admin/posts/UpdatePost";
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
        // Thuận
        {
          path: PATH_ADMIN.registration,
          element: <RegistrationAdminPage />,
        },
        //--------------------

        // Chị Tâm
        {
          path: PATH_ADMIN.post,
          element: <HomePost />,
        },
        {
          path: PATH_ADMIN.create_post,
          element: <CreatePost />,
        },
        {
          path: PATH_ADMIN.create_post_category,
          element: <CreatePostCategory />,
        },
        {
          path: PATH_ADMIN.post_category,
          element: <PostCategory />,
        },
        {
          path: PATH_ADMIN.update_post_category,
          element: <UpdatePostCategory />,
        },
        {
          path: PATH_ADMIN.update_post,
          element: <UpdatePost />,
        },

        //--------------------
        {
          path: PATH_ADMIN.post_detail,
          element: <PostDetails />,
        },
        {
          path: PATH_ADMIN.registration,
          element: <RegisterForm />,
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

// Thuận
const RegistrationAdminPage = Loadable(
  lazy(() => import("../pages/admin/Registration/index"))
);

//----------------------------

// Chị Tâm
const HomePost = Loadable(lazy(() => import("../pages/admin/posts/HomePost")));
import RegisterForm from './../pages/admin/Registration/RegisterForm';

//-----------------------------
