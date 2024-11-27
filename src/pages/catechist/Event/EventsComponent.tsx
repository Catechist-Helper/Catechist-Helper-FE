import {
  DataGrid,
  GridColDef,
  // GridRowSelectionModel
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import eventApi from "../../../api/Event";
import { EventItemResponse } from "../../../model/Response/Event";
import { RoleEventName } from "../../../enums/RoleEventEnum"; // Import enum
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import { getUserInfo } from "../../../utils/utils";
import { formatDate } from "../../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { PATH_CATECHIST } from "../../../routes/paths";

export default function EventsComponent() {
  const [rows, setRows] = useState<EventItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);
  const [userLogin, setUserLogin] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<{ [key: string]: RoleEventName }>(
    {}
  );
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      let userLoggedin = getUserInfo(); // Assume this function retrieves the user info
      setUserLogin(userLoggedin);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Get events where user is part of the organizer group
      const { data } = await eventApi.getAllEvents(); // Or any other suitable method to fetch events
      const eventsWithUserRole = await fetchUserEventsRole(data.data.items);
      setRows(eventsWithUserRole);
    } catch (error) {
      console.error("Error fetching events:", error);
      sweetAlert.alertFailed("Không thể tải danh sách sự kiện!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEventsRole = async (events: EventItemResponse[]) => {
    const eventsWithRole = await Promise.all(
      events.map(async (event) => {
        try {
          const membersResponse = await eventApi.getEventMembers(event.id);
          const members = membersResponse.data.data.items;

          // Find user's role in the event
          const userInEvent = members.find(
            (member) => member.account.id === userLogin.id
          );
          if (userInEvent) {
            const role = mapRoleToEnum(userInEvent.roleEvent.name);
            setUserRoles((prevRoles) => ({
              ...prevRoles,
              [event.id]: role,
            }));
            console.log(userRoles);
            return { ...event, userRole: role }; // Attach the role to the event
          }
          return null; // User is not in the event
        } catch (error) {
          console.error(
            `Error fetching event members for event ${event.id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter events where user is part of the organizers
    return eventsWithRole.filter((event) => event !== null);
  };

  // Map roleEvent from API response to our enum
  const mapRoleToEnum = (roleEvent: string): RoleEventName => {
    switch (roleEvent) {
      case "Trưởng ban tổ chức":
        return RoleEventName.TRUONG_BTC;
      case "Phó ban tổ chức":
        return RoleEventName.PHO_BTC;
      case "Thành viên ban tổ chức":
        return RoleEventName.MEMBER_BTC;
      default:
        return RoleEventName.MEMBER_BTC; // Default to member if no match
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên sự kiện", width: 200 },
    { field: "description", headerName: "Mô tả", width: 200 },
    {
      field: "startTime",
      headerName: "Thời gian bắt đầu",
      width: 160,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.startTime),
    },
    {
      field: "endTime",
      headerName: "Thời gian kết thúc",
      width: 160,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.endTime),
    },
    {
      field: "userRole",
      headerName: "Vai trò trong sự kiện",
      width: 200,
      renderCell: (params) => {
        return <span>{params.row.userRole}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 200,
      renderCell: (params) => {
        const userRole = params.row.userRole;
        return (
          <div>
            {userRole === RoleEventName.TRUONG_BTC && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleEventManagement(params.row.id)}
              >
                Quản lý sự kiện
              </Button>
            )}
            {userRole !== RoleEventName.TRUONG_BTC && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleEventManagement(params.row.id)}
              >
                Xem sự kiện
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const handleEventManagement = (eventId: string) => {
    navigate(PATH_CATECHIST.event_process, { state: { eventId } });
  };

  useEffect(() => {
    fetchUser(); // Fetch user info when the component is mounted
  }, []);

  useEffect(() => {
    if (userLogin) {
      fetchEvents(); // Fetch events once the user is fetched
    }
  }, [userLogin]);

  return (
    <div>
      <Paper
        sx={{
          width: "calc(100% - 3.8rem)",
          position: "absolute",
        }}
      >
        {" "}
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          //   disableSelectionOnClick
          localeText={viVNGridTranslation}
        />
      </Paper>
    </div>
  );
}
