import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
// components
import LoadingScreen from "../components/Organisms/LoadingScreen/LoadingScreen";
// guards
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import CreatePostCategory from "../pages/admin/posts/CreatePostCategory";
import PostCategory from "../pages/admin/posts/PostCategory";
import UpdatePostCategory from "../pages/admin/posts/UpdatePostCategory";
import CreatePost from "../pages/admin/posts/CreatePost";
import { PATH_ADMIN, PATH_CATECHIST, PATH_HOME } from "./paths";
import PostDetails from "../pages/admin/posts/PostDetails";
import UpdatePost from "../pages/admin/posts/UpdatePost";
import New from "../pages/common/News/New";
import NewDetails from "../pages/common/News/NewDetails";
import CreateChristianName from "../pages/admin/ChristianName/CreateChristianName";
import UpdateChristianName from "../pages/admin/ChristianName/UpdateChristianName";
import CreateRoom from "../pages/admin/Rooms/CreateRoom";
import UpdateRoom from "../pages/admin/Rooms/UpdateRoom";
import CreatePastoralYears from "../pages/admin/PastoralYears/CreatePastoralYears";
import UpdatePastoralYears from "../pages/admin/PastoralYears/UpdatePastoralYears";
import CreateConfig from "../pages/admin/SystemConfiguration/CreateConfig";
import UpdateConfig from "../pages/admin/SystemConfiguration/UpdateConfig";
import CreateLevel from "../pages/admin/Level/CreateLevel";
import UpdateLevel from "../pages/admin/Level/UpdateLevel";
import CreateTrain from "../pages/admin/TrainingList/CreateTrain";
import UpdateTrain from "../pages/admin/TrainingList/UpdateTrain";
import ListAllCatechistByLevel from "../pages/admin/TrainingList/ListAllCatechistByLevel";
import CreateCertificate from "../pages/admin/Certificate/CreateCertificate";
// path

// ----------------------------------------------------------------------

const Loadable = (Component: any) => (props: any) => {
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
              <CatechistManagement />
              {/* </RoleBasedGuard> */}
            </AuthGuard>
          ),
        },
        // Thuận
        {
          path: PATH_ADMIN.catechist_management,
          element: <CatechistManagement />,
        },
        {
          path: PATH_ADMIN.admin_registration,
          element: <RegistrationAdminPage />,
        },
        {
          path: PATH_ADMIN.approved_registration,
          element: <ApprovedRegistrationPage />,
        },
        {
          path: PATH_ADMIN.major_management,
          element: <MajorManagement />,
        },
        {
          path: PATH_ADMIN.grade_management,
          element: <GradeManagement />,
        },
        {
          path: PATH_ADMIN.class_management,
          element: <ClassManagement />,
        },
        {
          path: PATH_ADMIN.admin_event_category_management,
          element: <AdminEventCategoryManagement />,
        },
        {
          path: PATH_ADMIN.admin_event_management,
          element: <AdminEventManagement />,
        },
        {
          path: PATH_ADMIN.admin_event_process,
          element: <AdminEventProcessPage />,
        },
        {
          path: PATH_ADMIN.assign_catechist_to_grade,
          element: <AssignCatechistToGrade />,
        },
        {
          path: PATH_ADMIN.admin_management_file,
          element: <AdminFileManagement />,
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
        {
          path: PATH_ADMIN.update_room,
          element: <UpdateRoom />,
        },
        {
          path: PATH_ADMIN.system_configurations,
          element: <HomeConfig />,
        },
        {
          path: PATH_ADMIN.create_system_configurations,
          element: <CreateConfig />,
        },
        {
          path: PATH_ADMIN.update_system_configurations,
          element: <UpdateConfig />,
        },
        {
          path: PATH_ADMIN.levels,
          element: <HomeLevel />,
        },
        {
          path: PATH_ADMIN.create_levels,
          element: <CreateLevel />,
        },
        {
          path: PATH_ADMIN.update_levels,
          element: <UpdateLevel />,
        },
        {
          path: PATH_ADMIN.training_lists,
          element: <HomeTrain />,
        },
        {
          path: PATH_ADMIN.training_catechist,
          element: <ListAllCatechistByLevel />,
        },
        {
          path: PATH_ADMIN.create_training_lists,
          element: <CreateTrain />,
        },
        {
          path: PATH_ADMIN.update_training_lists,
          element: <UpdateTrain />,
        },
        {
          path: PATH_ADMIN.create_certificates,
          element: <CreateCertificate />,
        },
        {
          path: PATH_ADMIN.catechist_training,
          element: <ListAllTrainCatechist />,
        },
      ],
    },

    {
      path: "/catechist",
      children: [
        {
          path: "/catechist",
          element: (
            <AuthGuard>
              {/* <RoleBasedGuard accessibleRoles={[AccountRoleString.ADMIN]}> */}
              <CatechistClassPage />
              {/* </RoleBasedGuard> */}
            </AuthGuard>
          ),
        },
        {
          path: PATH_CATECHIST.class,
          element: <CatechistClassPage />,
        },
        {
          path: PATH_CATECHIST.interview,
          element: <CatechistInterViewPage />,
        },
        {
          path: PATH_CATECHIST.event,
          element: <CatechistEventPage />,
        },
        {
          path: PATH_CATECHIST.event_process,
          element: <CatechistEventProcessPage />,
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
// const AdminLandingPage = Loadable(
//   lazy(() => import("../pages/admin/AdminLandingPage/index"))
// );

// Thuận
const RegistrationAdminPage = Loadable(
  lazy(() => import("../pages/admin/Registration/index"))
);
const ApprovedRegistrationPage = Loadable(
  lazy(() => import("../pages/admin/ApprovedRegistration/index"))
);
const CatechistManagement = Loadable(
  lazy(() => import("../pages/admin/Catechists/index"))
);
const MajorManagement = Loadable(
  lazy(() => import("../pages/admin/Major/index"))
);
const GradeManagement = Loadable(
  lazy(() => import("../pages/admin/Grade/index"))
);
const ClassManagement = Loadable(
  lazy(() => import("../pages/admin/Class/index"))
);
const AssignCatechistToGrade = Loadable(
  lazy(() => import("../pages/admin/AssignCatechistToGrade/index"))
);
const AdminEventCategoryManagement = Loadable(
  lazy(() => import("../pages/admin/EventCategory/index"))
);
const AdminEventManagement = Loadable(
  lazy(() => import("../pages/admin/Event/index"))
);
const AdminFileManagement = Loadable(
  lazy(() => import("../pages/admin/File/index"))
);
const CatechistInterViewPage = Loadable(
  lazy(() => import("../pages/catechist/Interview/index"))
);
const CatechistClassPage = Loadable(
  lazy(() => import("../pages/catechist/Class/index"))
);
const CatechistEventPage = Loadable(
  lazy(() => import("../pages/catechist/Event/index"))
);
const CatechistEventProcessPage = Loadable(
  lazy(() => import("../pages/catechist/EventProcess/index"))
);
const AdminEventProcessPage = Loadable(
  lazy(() => import("../pages/admin/EventProcess/index"))
);
//----------------------------

// Chị Tâm
const HomePost = Loadable(lazy(() => import("../pages/admin/posts/HomePost")));
const RegisterForm = Loadable(
  lazy(() => import("./../pages/admin/Registration/RegisterForm"))
);
const ListAllTrainCatechist = Loadable(
  lazy(() => import("../pages/admin/TrainingList/ListAllTrainCatechist"))
);
const HomeChristianName = Loadable(
  lazy(() => import("../pages/admin/ChristianName/HomeChristianName"))
);
const HomeRoom = Loadable(lazy(() => import("../pages/admin/Rooms/HomeRoom")));

const HomePastoralYears = Loadable(
  lazy(() => import("../pages/admin/PastoralYears/HomePastoralYears"))
);
const HomeConfig = Loadable(
  lazy(() => import("../pages/admin/SystemConfiguration/HomeConfig"))
);
const HomeLevel = Loadable(
  lazy(() => import("../pages/admin/Level/HomeLevel"))
);
const HomeTrain = Loadable(
  lazy(() => import("../pages/admin/TrainingList/HomeTrain"))
);
//-----------------------------import CreateConfig from './../pages/admin/SystemConfiguration/CreateConfig';
