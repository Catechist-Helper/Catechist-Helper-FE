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
import RoleBasedGuard from "../guards/RoleBasedGuard";
import { RoleNameEnum } from "../enums/RoleEnum";
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
        {
          path: PATH_HOME.meeting,
          element: (
            // <GuestGuard>
            <Meeting />
            // </GuestGuard>
          ),
        },
        {
          path: PATH_HOME.room,
          element: (
            // <GuestGuard>
            <Room />
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
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CatechistManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.catechist_management,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CatechistManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.admin_registration,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <RegistrationAdminPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.approved_registration,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <ApprovedRegistrationPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.major_management,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <MajorManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.grade_management,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <GradeManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.class_management,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <ClassManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.admin_event_category_management,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <AdminEventCategoryManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.admin_event_management,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <AdminEventManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.admin_event_process,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <AdminEventProcessPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.assign_catechist_to_grade,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <AssignCatechistToGrade />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.admin_management_absence,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <AbsenceRequestAdmin />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.admin_management_file,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <AdminFileManagement />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.post,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomePost />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_post,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreatePost />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_post_category,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreatePostCategory />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.post_category,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <PostCategory />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_post_category,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdatePostCategory />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_post,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdatePost />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.post_detail,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <PostDetails />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_christian_name,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreateChristianName />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_christian_name,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdateChristianName />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.christian_name,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomeChristianName />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.rooms,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomeRoom />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_room,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreateRoom />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.pastoral_years,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomePastoralYears />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_pastoral_years,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreatePastoralYears />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_pastoral_years,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdatePastoralYears />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_room,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdateRoom />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.system_configurations,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomeConfig />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_system_configurations,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreateConfig />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_system_configurations,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdateConfig />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.levels,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomeLevel />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_levels,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreateLevel />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_levels,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdateLevel />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.training_lists,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <HomeTrain />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.training_catechist,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <ListAllCatechistByLevel />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_training_lists,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreateTrain />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.update_training_lists,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <UpdateTrain />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.create_certificates,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <CreateCertificate />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_ADMIN.catechist_training,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Admin]}>
                <ListAllTrainCatechist />
              </RoleBasedGuard>
            </AuthGuard>
          ),
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
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Catechist]}>
                <CatechistClassPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_CATECHIST.class,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Catechist]}>
                <CatechistClassPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_CATECHIST.interview,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Catechist]}>
                <CatechistInterViewPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_CATECHIST.event,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Catechist]}>
                <CatechistEventPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
        },
        {
          path: PATH_CATECHIST.event_process,
          element: (
            <AuthGuard>
              <RoleBasedGuard accessibleRoles={[RoleNameEnum.Catechist]}>
                <CatechistEventProcessPage />
              </RoleBasedGuard>
            </AuthGuard>
          ),
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

const Meeting = Loadable(lazy(() => import("../pages/common/Meeting/Meeting")));

const Room = Loadable(lazy(() => import("../pages/common/Meeting/Room")));
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
const AbsenceRequestAdmin = Loadable(
  lazy(() => import("../pages/admin/AbsenceRequest/index"))
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
