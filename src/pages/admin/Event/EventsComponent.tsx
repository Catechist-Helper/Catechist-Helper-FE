import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import eventApi from "../../../api/Event";
import eventCategoryApi from "../../../api/EventCategory";
import {
  // BudgetTransactionResponseItem,
  EventItemResponse,
  ParticipantResponseItem,
} from "../../../model/Response/Event";
import { EventCategoryItemResponse } from "../../../model/Response/EventCategory";
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import EventDialog from "./EventDialog"; // Dialog for Create/Update
import { formatDate } from "../../../utils/formatDate";
import { formatPrice } from "../../../utils/formatPrice";
import OrganizersDialog from "./OrganizersDialog";
import AddParticipantsDialog from "./AddParticipantsDialog";
import ParticipantsDialog from "./ParticipantsDialog";
// import BudgetDialog from "./BudgetDialog";
import { PATH_ADMIN } from "../../../routes/paths";
import { useNavigate } from "react-router-dom";
import { EventStatus, EventStatusString } from "../../../enums/Event";
import { storeCurrentPath } from "../../../utils/utils";

export default function EventsComponent() {
  const [rows, setRows] = useState<EventItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);
  const [eventCategories, setEventCategories] = useState<
    EventCategoryItemResponse[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | "Tất cả"
  >("Tất cả");
  const [filteredStatus, setFilteredStatus] = useState<number>(-1);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItemResponse | null>(
    null
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // ID của sự kiện được chọn
  const [openOrganizersDialog, setOpenOrganizersDialog] =
    useState<boolean>(false); // Trạng thái mở/đóng của dialog
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const navigate = useNavigate();

  const openAddParticipantsDialog = (eventId: string, eventName: string) => {
    setSelectedEventId(eventId);
    setSelectedEventName(eventName);
    setOpenAddDialog(true);
  };

  const closeAddParticipantsDialog = () => {
    setOpenAddDialog(false);
    setSelectedEventId(null);
    setSelectedEventName("");
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên sự kiện", width: 200 },
    { field: "description", headerName: "Mô tả", width: 200 },
    {
      field: "startTime",
      headerName: "Thời gian bắt đầu",
      width: 140,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.startTime),
    },
    {
      field: "endTime",
      headerName: "Thời gian kết thúc",
      width: 140,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.endTime),
    },
    // {
    //   field: "current_budget",
    //   headerName: "Ngân sách hiện tại",
    //   width: 180,
    //   renderCell: (params) => {
    //     return (
    //       <div style={{ display: "flex", alignItems: "center" }}>
    //         <Button
    //           variant="contained"
    //           color={"primary"}
    //           style={{ marginRight: "10px" }}
    //           onClick={() =>
    //             handleBudgetTransactions(params.row.id, params.row.name)
    //           }
    //         >
    //           Xem
    //         </Button>{" "}
    //         <span> ₫ {formatPrice(params.value)}</span>
    //       </div>
    //     );
    //   },
    // },

    {
      field: "eventCategory",
      headerName: "Danh mục",
      width: 110,
      renderCell: (params) => params.row.eventCategory?.name || "N/A",
    },
    {
      field: "totalCost",
      headerName: "Tổng chi phí",
      width: 110,
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
      width: 135,
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
      field: "processes",
      headerName: "Hoạt động",
      width: 100,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color={"secondary"}
            onClick={() => handleViewProcesses(params.row.id)}
          >
            Xem
          </Button>
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
            {params.row.eventStatus == EventStatus.Completed ||
            params.row.eventStatus == EventStatus.Cancelled ? (
              <>
                {organizersCount > 0 ? (
                  <>
                    <Button
                      variant="text"
                      color={"primary"}
                      className="btn btn-primary"
                      style={{ marginLeft: "10px" }}
                      onClick={() =>
                        handleOrganizers(
                          params.row.id,
                          organizersCount > 0,
                          true
                        )
                      }
                    >
                      Xem
                    </Button>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  color={organizersCount > 0 ? "primary" : "secondary"}
                  className={`${organizersCount > 0 ? "btn btn-primary" : "hover:bg-purple-800 hover:text-white hover:border-purple-800"}`}
                  style={{ marginLeft: "10px" }}
                  onClick={() =>
                    handleOrganizers(params.row.id, organizersCount > 0)
                  }
                >
                  {organizersCount > 0 ? "Xem" : "Thêm"}
                </Button>
              </>
            )}
          </div>
        );
      },
    },
    {
      field: "participants",
      headerName: "Số người tham gia",
      width: 155,
      renderCell: (params) => {
        const participantsCount = params.row.participantsCount || 0;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{participantsCount}</span>
            {participantsCount && participantsCount > 0 ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: "10px" }}
                  onClick={() =>
                    handleParticipants(params.row.id, params.row.name)
                  }
                >
                  Xem
                </Button>
              </>
            ) : (
              <></>
            )}

            {params.row.eventStatus == EventStatus.Not_Started ||
            params.row.eventStatus == EventStatus.In_Progress ? (
              <>
                <Button
                  color="secondary"
                  className="hover:bg-purple-800 hover:text-white hover:border-purple-800 ml-1"
                  style={{ marginLeft: "5px" }}
                  onClick={() =>
                    openAddParticipantsDialog(params.row.id, params.row.name)
                  }
                >
                  Thêm
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
    { field: "address", headerName: "Địa chỉ", width: 100 },
    { field: "note", headerName: "Ghi chú", width: 100 },
  ];

  // Fetch số người trong ban tổ chức và tham gia
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

      await fetchAdditionalData(finalItems);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      sweetAlert.alertFailed("Không thể tải danh sách sự kiện!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  const [viewOrganizersDialogMode, setViewOrganizersDialogMode] =
    useState<boolean>(false);
  const [cateMode, setCateMode] = useState<boolean>(false);

  const handleOrganizers = (
    eventId: string,
    hasOrganizers: boolean,
    cateMode?: boolean
  ) => {
    setCateMode(cateMode ? true : false);
    if (hasOrganizers) {
      setSelectedEventId(eventId); // Lưu lại ID sự kiện
      setOpenOrganizersDialog(true); // Mở dialog
    } else {
      setSelectedEventId(eventId); // Lưu lại ID sự kiện
      setOpenOrganizersDialog(true); // Mở dialog
    }
    setViewOrganizersDialogMode(hasOrganizers);
  };
  useEffect(() => {
    if (!openOrganizersDialog) {
      setViewOrganizersDialogMode(false);
    }
  }, [openOrganizersDialog]);

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
  //     ); // Gọi API với phân trang
  //     const sortedTransactions = data.data.items.sort(
  //       (a, b) =>
  //         new Date(b.transactionAt).getTime() -
  //         new Date(a.transactionAt).getTime()
  //     ); // Sắp xếp theo `transactionAt`

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
    storeCurrentPath(PATH_ADMIN.admin_event_management);
  }, []);

  useEffect(() => {
    fetchEvents(); // Fetch events khi selectedCategoryId thay đổi
  }, [selectedCategoryId, filteredStatus]);

  // Mở dialog để thêm mới sự kiện
  const handleAddEvent = () => {
    setEditingEvent(null);
    setOpenDialog(true);
  };

  const handleViewProcesses = (eventId?: string) => {
    if (selectedIds.length !== 1 && !eventId) {
      sweetAlert.alertWarning("Vui lòng chọn 1 sự kiện để xem!", "", 1000, 22);
      return;
    }

    navigate(PATH_ADMIN.admin_event_process_management, {
      state: { eventId: eventId ? eventId : selectedIds[0] },
    });
  };

  // Mở dialog để chỉnh sửa sự kiện
  const handleEditEvent = () => {
    if (selectedIds.length !== 1) {
      sweetAlert.alertWarning(
        "Vui lòng chọn 1 sự kiện để chỉnh sửa!",
        "",
        1000,
        22
      );
      return;
    }

    const selectedEvent = rows.find((row) => row.id === selectedIds[0]);
    if (selectedEvent) {
      // const now = new Date();
      // const startTime = new Date(selectedEvent.startTime);

      // if (now > startTime) {
      //   sweetAlert.alertWarning(
      //     "Sự kiện đã bắt đầu, không thể chỉnh sửa!",
      //     "",
      //     5000,
      //     30
      //   );
      //   return;
      // }

      if (selectedEvent.eventStatus == EventStatus.Completed) {
        sweetAlert.alertWarning(
          "Sự kiện đã kết thúc, không thể chỉnh sửa!",
          "",
          3000,
          30
        );
        return;
      }

      if (selectedEvent.eventStatus == EventStatus.Cancelled) {
        sweetAlert.alertWarning(
          "Sự kiện đã hủy bỏ, không thể chỉnh sửa!",
          "",
          3000,
          30
        );
        return;
      }

      setEditingEvent(selectedEvent);
      setOpenDialog(true);
    }
  };

  // Xử lý xóa sự kiện
  const handleDeleteEvent = async () => {
    const event: any = rows.find(
      (item) => item.id == selectedIds[0].toString()
    );

    if (selectedIds.length === 0 || !event) {
      sweetAlert.alertWarning("Vui lòng chọn sự kiện để xóa!", "", 1000, 22);
      return;
    }

    if (event.eventStatus == EventStatus.In_Progress) {
      sweetAlert.alertFailed("Không thể xóa vì sự kiện này đang làm");
      return;
    }

    if (event.eventStatus == EventStatus.Completed) {
      sweetAlert.alertFailed("Không thể xóa vì sự kiện này đã hoàn thành");
      return;
    }

    // const now = new Date();
    // const invalidEvents = rows.filter(
    //   (row) => selectedIds.includes(row.id) && new Date(row.startTime) <= now
    // );

    // if (invalidEvents.length > 0) {
    //   sweetAlert.alertFailed("Không thể xóa vì sự kiện này đã bắt đầu");
    //   return;
    // }

    const confirm = await sweetAlert.confirm(
      `Xác nhận xóa sự kiện ${event ? event?.name : ""}?`,
      "",
      // `Xác nhận xóa sự kiện ${event ? event?.name : ""}?`,
      "Xóa",
      "Hủy",
      "question"
    );
    if (!confirm) return;

    try {
      await Promise.all(
        selectedIds.map((id) => eventApi.deleteEvent(id.toString()))
      );
      sweetAlert.alertSuccess("Xóa sự kiện thành công!", "", 3000, 22);
      fetchEvents();
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện:", error);
      sweetAlert.alertFailed("Không thể xóa sự kiện!", "", 3000, 22);
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Quản lý sự kiện
      </h1>
      <div className="my-2 flex justify-between mx-3 mt-3">
        {/* Bộ lọc danh mục sự kiện */}
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
          {selectedIds.length === 1 ? (
            <>
              <Button
                variant="outlined"
                color="error"
                className="btn btn-danger"
                onClick={handleDeleteEvent}
              >
                Xóa
              </Button>
              <Button
                variant="outlined"
                color="warning"
                className="btn btn-warning"
                onClick={handleEditEvent}
              >
                Chỉnh sửa
              </Button>
              {/* <Button
                variant="outlined"
                color="primary"
                className="btn btn-primary"
                onClick={() => {
                }}
              >
                Xem hoạt động
              </Button> */}
            </>
          ) : (
            <></>
          )}
          <Button
            variant="outlined"
            color="success"
            className="btn btn-success"
            onClick={handleAddEvent}
          >
            Thêm mới
          </Button>
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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100, 250]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) =>
            setSelectedIds(newSelection)
          }
          localeText={viVNGridTranslation}
          sx={{
            height: 480,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          disableMultipleRowSelection
        />
      </div>
      {/* Dialog thêm/chỉnh sửa */}
      {openDialog && (
        <EventDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          event={editingEvent ?? undefined}
          refresh={fetchEvents}
        />
      )}
      {openOrganizersDialog && selectedEventId && (
        <OrganizersDialog
          catechistMode={cateMode}
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
      {openAddDialog && selectedEventId && (
        <AddParticipantsDialog
          open={openAddDialog}
          onClose={closeAddParticipantsDialog}
          eventId={selectedEventId || ""}
          eventName={selectedEventName}
          refresh={fetchEvents}
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
      {/* {openBudgetDialog && (
        <BudgetDialog
          open={openBudgetDialog}
          onClose={() => setOpenBudgetDialog(false)}
          transactions={budgetTransactions}
          eventName={selectedEventNameForBudget}
        />
      )} */}
    </Paper>
  );
}
