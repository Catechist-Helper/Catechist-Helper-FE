import {
  DataGrid,
  GridColDef,
  // GridRowSelectionModel
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useState, useEffect } from "react";
import eventApi from "../../../api/Event";
import {
  // BudgetTransactionResponseItem,
  EventItemResponse,
  ParticipantResponseItem,
} from "../../../model/Response/Event";
import { RoleEventName } from "../../../enums/RoleEventEnum"; // Import enum
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import { getUserInfo, storeCurrentPath } from "../../../utils/utils";
import { formatDate } from "../../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { PATH_CATECHIST } from "../../../routes/paths";
import { formatPrice } from "../../../utils/formatPrice";
// import BudgetDialog from "../../admin/Event/BudgetDialog";
import { EventCategoryItemResponse } from "../../../model/Response/EventCategory";
import eventCategoryApi from "../../../api/EventCategory";
import OrganizersDialog from "../../admin/Event/OrganizersDialog";
import ParticipantsDialog from "../../admin/Event/ParticipantsDialog";
import { EventStatus, EventStatusString } from "../../../enums/Event";

export default function EventsComponent() {
  const [rows, setRows] = useState<EventItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);
  const [userLogin, setUserLogin] = useState<any>(null);
  const [eventCategories, setEventCategories] = useState<
    EventCategoryItemResponse[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | "Tất cả"
  >("Tất cả");
  const [filteredStatus, setFilteredStatus] = useState<number>(-1);

  const navigate = useNavigate();

  // Fetch Event Categories
  const fetchEventCategories = async () => {
    try {
      const { data } = await eventCategoryApi.getAllEventCategories();
      setEventCategories(data.data.items);
    } catch (error) {
      console.error("Lỗi khi tải danh mục sự kiện:", error);
    }
  };

  useEffect(() => {
    fetchEventCategories(); // Fetch event categories khi component được mount
  }, []);

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
      const firstRes =
        selectedCategoryId === "Tất cả"
          ? await eventApi.getAllEvents()
          : await eventApi.getAllEvents(selectedCategoryId);
      const { data } =
        selectedCategoryId === "Tất cả"
          ? await eventApi.getAllEvents(undefined, 1, firstRes.data.data.total)
          : await eventApi.getAllEvents(
              selectedCategoryId,
              1,
              firstRes.data.data.total
            );

      let finalItems = [...data.data.items];
      if (filteredStatus >= 0) {
        finalItems = [...data.data.items].filter(
          (item) => item.eventStatus == filteredStatus
        );
      }

      const eventsWithUserRole = await fetchUserEventsRole(finalItems);
      await fetchAdditionalData(eventsWithUserRole);
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
            // setUserRoles((prevRoles) => ({
            //   ...prevRoles,
            //   [event.id]: role,
            // }));
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

  const fetchAdditionalData = async (events: EventItemResponse[]) => {
    const updatedEvents = await Promise.all(
      events.map(async (event) => {
        try {
          // Gọi API để lấy số người trong ban tổ chức
          const organizersResponse = await eventApi.getEventMembers(event.id);
          const organizersCount = organizersResponse.data.data.items.length;

          // Gọi API để lấy số người tham gia
          const participantsResponse = await eventApi.getEventParticipants(
            event.id
          );
          const participantsCount = participantsResponse.data.data.items.length;

          return {
            ...event,
            organizersCount,
            participantsCount,
          };
        } catch (error) {
          console.error(
            `Lỗi khi tải dữ liệu bổ sung cho sự kiện ${event.id}:`,
            error
          );
          return { ...event, organizersCount: 0, participantsCount: 0 };
        }
      })
    );
    setRows(updatedEvents);
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
  // const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  // const [budgetTransactions, setBudgetTransactions] = useState<
  //   BudgetTransactionResponseItem[]
  // >([]);
  // const [selectedEventNameForBudget, setSelectedEventNameForBudget] =
  //   useState<string>("");
  // const handleBudgetTransactions = async (
  //   eventId: string,
  //   eventName: string
  // ) => {
  //   try {
  //     setLoading(true);
  //     setSelectedEventNameForBudget(eventName);

  //     const firstRes = await eventApi.getEventBudgetTransactions(eventId);
  //     const { data } = await eventApi.getEventBudgetTransactions(
  //       eventId,
  //       1,
  //       firstRes.data.data.total
  //     );
  //     const sortedTransactions = data.data.items.sort(
  //       (a, b) =>
  //         new Date(b.transactionAt).getTime() -
  //         new Date(a.transactionAt).getTime()
  //     );

  //     setBudgetTransactions(sortedTransactions);
  //     setOpenBudgetDialog(true); // Mở dialog
  //   } catch (error) {
  //     console.error("Lỗi khi tải danh sách giao dịch ngân sách:", error);
  //     sweetAlert.alertFailed(
  //       "Không thể tải danh sách ngân sách!",
  //       "",
  //       1000,
  //       22
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // ID của sự kiện được chọn
  const [openOrganizersDialog, setOpenOrganizersDialog] =
    useState<boolean>(false);
  const [viewOrganizersDialogMode, setViewOrganizersDialogMode] =
    useState<boolean>(false);
  const handleOrganizers = (eventId: string, hasOrganizers: boolean) => {
    if (hasOrganizers) {
      setSelectedEventId(eventId); // Lưu lại ID sự kiện
      setOpenOrganizersDialog(true); // Mở dialog
    } else {
      setSelectedEventId(eventId); // Lưu lại ID sự kiện
      setOpenOrganizersDialog(true); // Mở dialog
    }
    setViewOrganizersDialogMode(hasOrganizers);
  };

  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
  const [participants, setParticipants] = useState<ParticipantResponseItem[]>(
    []
  );
  const [
    selectedEventNameForParticipants,
    setSelectedEventNameForParticipants,
  ] = useState<string>("");
  const handleParticipants = async (eventId: string, eventName: string) => {
    try {
      setLoading(true);
      setSelectedEventNameForParticipants(eventName);

      const firstRes = await eventApi.getEventParticipants(eventId);
      const { data } = await eventApi.getEventParticipants(
        eventId,
        1,
        firstRes.data.data.total
      );
      setParticipants(data.data.items);

      setOpenParticipantsDialog(true); // Mở dialog
    } catch (error) {
      console.error("Lỗi khi tải danh sách người tham gia:", error);
      sweetAlert.alertFailed(
        "Không thể tải danh sách người tham gia!",
        "",
        1000,
        22
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên sự kiện", width: 200 },
    { field: "description", headerName: "Mô tả", width: 170 },
    {
      field: "startTime",
      headerName: "Thời gian bắt đầu",
      width: 135,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.startTime),
    },
    {
      field: "endTime",
      headerName: "Thời gian kết thúc",
      width: 135,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.endTime),
    },
    // {
    //   field: "current_budget",
    //   headerName: "Ngân sách hiện tại",
    //   width: 200,
    //   renderCell: (params) => {
    //     return (
    //       <div style={{ display: "flex", alignItems: "center" }}>
    //         {params.row.userRole == RoleEventName.TRUONG_BTC ? (
    //           <Button
    //             variant="contained"
    //             color={"primary"}
    //             style={{ marginRight: "10px" }}
    //             onClick={() =>
    //               handleBudgetTransactions(params.row.id, params.row.name)
    //             }
    //           >
    //             Xem
    //           </Button>
    //         ) : (
    //           <></>
    //         )}{" "}
    //         <span> ₫ {formatPrice(params.value)}</span>
    //       </div>
    //     );
    //   },
    // },
    {
      field: "eventCategory",
      headerName: "Danh mục",
      width: 105,
      renderCell: (params) => params.row.eventCategory?.name || "N/A",
    },
    {
      field: "totalCost",
      headerName: "Tổng chi phí",
      width: 105,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span>
          <span> ₫ {formatPrice(params.value)}</span>
        </span>
      ),
    },
    {
      field: "eventStatus",
      headerName: "Trạng thái",
      width: 125,
      renderCell: (params) => {
        switch (params.value) {
          case EventStatus.Not_Started:
            return (
              <span className="rounded-xl px-2 py-1 bg-black text-white">
                {EventStatusString.Not_Started}
              </span>
            );
          case EventStatus.In_Progress:
            return (
              <span className="rounded-xl px-2 py-1 bg-warning text-black">
                {EventStatusString.In_Progress}
              </span>
            );
          case EventStatus.Completed:
            return (
              <span className="rounded-xl px-2 py-1 bg-success text-white">
                {EventStatusString.Completed}
              </span>
            );
          case EventStatus.Cancelled:
            return (
              <span className="rounded-xl px-2 py-1 bg-danger text-white">
                {EventStatusString.Cancelled}
              </span>
            );
          default:
            return <></>;
        }
      },
    },
    {
      field: "userRole",
      headerName: "Vai trò trong sự kiện",
      width: 170,
      renderCell: (params) => {
        return <span>{params.row.userRole}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 190,
      renderCell: (params) => {
        const userRole = params.row.userRole;
        return (
          <div>
            {userRole === RoleEventName.TRUONG_BTC && (
              <Button
                variant="contained"
                onClick={() => {
                  if (params.row.eventStatus == EventStatus.Not_Started) {
                    sweetAlert.alertInfo("Sự kiện này chưa bắt đầu");
                  } else {
                    handleEventManagement(params.row.id, params.row.userRole);
                  }
                }}
                sx={{
                  background: `${params.row.eventStatus == EventStatus.Not_Started ? "gray" : "#1976d2"}`,
                }}
              >
                Quản lý sự kiện
              </Button>
            )}
            {userRole !== RoleEventName.TRUONG_BTC && (
              <Button
                variant="contained"
                sx={{
                  background: `${params.row.eventStatus == EventStatus.Not_Started ? "gray" : "#1976d2"}`,
                }}
                onClick={() => {
                  if (params.row.eventStatus == EventStatus.Not_Started) {
                    sweetAlert.alertInfo("Sự kiện này chưa bắt đầu");
                  } else {
                    handleEventManagement(params.row.id, params.row.userRole);
                  }
                }}
              >
                Xem sự kiện
              </Button>
            )}
          </div>
        );
      },
    },

    {
      field: "organizers",
      headerName: "Ban tổ chức",
      width: 120,
      renderCell: (params) => {
        const organizersCount = params.row.organizersCount || 0;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{organizersCount}</span>
            {organizersCount > 0 ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: "10px" }}
                  onClick={() =>
                    handleOrganizers(params.row.id, organizersCount > 0)
                  }
                >
                  Xem
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
    {
      field: "participants",
      headerName: "Người tham gia",
      width: 140,
      renderCell: (params) => {
        const participantsCount = params.row.participantsCount || 0;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{participantsCount}</span>
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "10px" }}
              onClick={() => handleParticipants(params.row.id, params.row.name)}
            >
              Xem
            </Button>
          </div>
        );
      },
    },
    { field: "address", headerName: "Địa chỉ", width: 100 },
    { field: "note", headerName: "Ghi chú", width: 100 },
  ];

  const handleEventManagement = (eventId: string, userRole: string) => {
    navigate(PATH_CATECHIST.event_process, {
      state: { eventId: eventId, userRole: userRole },
    });
  };

  useEffect(() => {
    fetchUser(); // Fetch user info when the component is mounted
    storeCurrentPath(PATH_CATECHIST.event);
  }, []);

  useEffect(() => {
    if (userLogin) {
      fetchEvents(); // Fetch events once the user is fetched
    }
  }, [userLogin, selectedCategoryId, filteredStatus]);

  if (!userLogin || !userLogin.id) {
    return <></>;
  }

  return (
    <div>
      <Paper
        sx={{
          width: "calc(100% - 3.8rem)",
          position: "absolute",
          left: "3.8rem",
        }}
      >
        <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
          Danh sách các sự kiện
        </h1>

        <div className="my-2 flex justify-between mx-3 mt-3">
          <div className="flex gap-x-3">
            <FormControl variant="outlined" style={{ minWidth: 200 }}>
              <InputLabel>Danh mục sự kiện</InputLabel>
              <Select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                label="Danh mục sự kiện"
                className="h-[43px]"
              >
                <MenuItem value="Tất cả">Tất cả</MenuItem>
                {eventCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" style={{ minWidth: 200 }}>
              <InputLabel>Trạng thái sự kiện</InputLabel>
              <Select
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(Number(e.target.value))}
                label="Trạng thái sự kiện"
                className="h-[43px]"
              >
                <MenuItem value={-1}>Tất cả</MenuItem>
                <MenuItem value={EventStatus.Not_Started}>
                  {EventStatusString.Not_Started}
                </MenuItem>
                <MenuItem value={EventStatus.In_Progress}>
                  {EventStatusString.In_Progress}
                </MenuItem>
                <MenuItem value={EventStatus.Completed}>
                  {EventStatusString.Completed}
                </MenuItem>
                <MenuItem value={EventStatus.Cancelled}>
                  {EventStatusString.Cancelled}
                </MenuItem>
              </Select>
            </FormControl>
          </div>
          {/* Các nút thêm, sửa, xóa */}
          <div className="space-x-2">
            <Button onClick={fetchEvents} variant="contained" color="primary">
              Tải lại
            </Button>
          </div>
        </div>
        <div className="w-full px-3">
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            localeText={viVNGridTranslation}
            disableRowSelectionOnClick
            sx={{
              height: 480,
              overflowX: "auto",
              "& .MuiDataGrid-root": {
                overflowX: "auto",
              },
            }}
          />
        </div>
        {/* {openBudgetDialog && (
          <BudgetDialog
            open={openBudgetDialog}
            onClose={() => setOpenBudgetDialog(false)}
            transactions={budgetTransactions}
            eventName={selectedEventNameForBudget}
          />
        )} */}
        {openOrganizersDialog && selectedEventId && (
          <OrganizersDialog
            catechistMode={true}
            viewOrganizersDialogMode={viewOrganizersDialogMode}
            open={openOrganizersDialog}
            onClose={() => {
              setOpenOrganizersDialog(false); // Đóng dialog
              setSelectedEventId(null); // Xóa ID sự kiện sau khi đóng
            }}
            eventId={selectedEventId}
            refresh={fetchEvents} // Hàm refresh danh sách sự kiện
          />
        )}
        {openParticipantsDialog && (
          <ParticipantsDialog
            open={openParticipantsDialog}
            onClose={() => setOpenParticipantsDialog(false)}
            participants={participants}
            eventName={selectedEventNameForParticipants}
          />
        )}
      </Paper>
    </div>
  );
}
