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
import { PATH_ADMIN, PATH_HOME } from "./paths";
import PostDetails from "../pages/admin/posts/PostDetails";
import UpdatePost from "../pages/admin/posts/UpdatePost";
import New from "../pages/common/News/New";
import NewDetails from "../pages/common/News/NewDetails";
import CreateChristianName from "../pages/admin/ChristianName/CreateChristianName";
import UpdateChristianName from "../pages/admin/ChristianName/UpdateChristianName";
import CreateRoom from "../pages/admin/Rooms/CreateRoom";
import CreatePastoralYears from "../pages/admin/PastoralYears/CreatePastoralYears";
import UpdatePastoralYears from "../pages/admin/PastoralYears/UpdatePastoralYears";
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
        {
          path: PATH_HOME.news,
          element: (
            // <GuestGuard>
            <New />
            // </GuestGuard>
          ),
        },
        {
          path: PATH_HOME.news_detail,
          element: (
            // <GuestGuard>
            <NewDetails />
            // </GuestGuard>
          ),
        },
        {
          path: PATH_HOME.registration,
          element: (
            // <GuestGuard>
            <RegisterForm />
            // </GuestGuard>
          ),
        },
      ],
    },

    {
      path: "/admin",
      children: [
        {
          path: "/admin",
          element: (
            <AuthGuard>
              {/* <RoleBasedGuard accessibleRoles={[AccountRoleString.ADMIN]}> */}
              <AdminLandingPage />
              {/* </RoleBasedGuard> */}
            </AuthGuard>
          ),
        },
        // Thuận
        {
          path: PATH_ADMIN.admin_registration,
          element: <RegistrationAdminPage />,
        },
        {
          path: PATH_ADMIN.approved_registration,
          element: <ApprovedRegistrationPage />,
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
          path: PATH_ADMIN.create_christian_name,
          element: <CreateChristianName />,
        },
        {
          path: PATH_ADMIN.update_christian_name,
          element: <UpdateChristianName />,
        },
        {
          path: PATH_ADMIN.christian_name,
          element: <HomeChristianName />,
        },
        {
          path: PATH_ADMIN.rooms,
          element: <HomeRoom />,
        },
        {
          path: PATH_ADMIN.create_room,
          element: <CreateRoom />,
        },
        {
          path: PATH_ADMIN.pastoral_years,
          element: <HomePastoralYears />,
        },
        {
          path: PATH_ADMIN.create_pastoral_years,
          element: <CreatePastoralYears />,
        },
        {
          path: PATH_ADMIN.update_pastoral_years,
          element: <UpdatePastoralYears />,
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
const ApprovedRegistrationPage = Loadable(
  lazy(() => import("../pages/admin/ApprovedRegistration/index"))
);
//----------------------------

// Chị Tâm
const HomePost = Loadable(lazy(() => import("../pages/admin/posts/HomePost")));
import RegisterForm from "./../pages/admin/Registration/RegisterForm";
const HomeChristianName = Loadable(lazy(() => import("../pages/admin/ChristianName/HomeChristianName")));
const HomeRoom = Loadable(lazy(() => import("../pages/admin/Rooms/HomeRoom")));
const HomePastoralYears = Loadable(lazy(() => import("../pages/admin/PastoralYears/HomePastoralYears")));

//-----------------------------
