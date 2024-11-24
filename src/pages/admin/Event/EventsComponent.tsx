import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
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
import { EventItemResponse } from "../../../model/Response/Event";
import { EventCategoryItemResponse } from "../../../model/Response/EventCategory";
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import EventDialog from "./EventDialog"; // Dialog for Create/Update
import { formatDate } from "../../../utils/formatDate";

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
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItemResponse | null>(
    null
  );

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
    { field: "current_budget", headerName: "Ngân sách hiện tại", width: 160 },
    {
      field: "eventCategory",
      headerName: "Danh mục",
      width: 160,
      renderCell: (params) => params.row.eventCategory?.name || "N/A",
    },
    {
      field: "organizers",
      headerName: "Ban tổ chức",
      width: 200,
      renderCell: (params) => {
        const organizersCount = params.row.organizersCount || 0;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{organizersCount}</span>
            <Button
              variant="contained"
              color={organizersCount > 0 ? "primary" : "secondary"}
              style={{ marginLeft: "10px" }}
              onClick={() =>
                handleOrganizers(params.row.id, organizersCount > 0)
              }
            >
              {organizersCount > 0 ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        );
      },
    },
    {
      field: "participants",
      headerName: "Số người tham gia",
      width: 200,
      renderCell: (params) => {
        const participantsCount = params.row.participantsCount || 0;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{participantsCount}</span>
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "10px" }}
              onClick={() => handleParticipants(params.row.id)}
            >
              Xem
            </Button>
          </div>
        );
      },
    },
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
      const { data } =
        selectedCategoryId === "Tất cả"
          ? await eventApi.getAllEvents()
          : await eventApi.getAllEvents(selectedCategoryId);
      await fetchAdditionalData(data.data.items); // Gọi thêm fetch dữ liệu bổ sung
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      sweetAlert.alertFailed("Không thể tải danh sách sự kiện!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizers = (eventId: string, hasOrganizers: boolean) => {
    console.log(eventId);

    if (hasOrganizers) {
      // Điều hướng hoặc hiển thị giao diện cập nhật ban tổ chức
      sweetAlert.alertInfo(
        "Chức năng cập nhật ban tổ chức đang được phát triển!",
        "",
        1000,
        22
      );
    } else {
      // Điều hướng hoặc hiển thị giao diện thêm mới ban tổ chức
      sweetAlert.alertInfo(
        "Chức năng thêm ban tổ chức đang được phát triển!",
        "",
        1000,
        22
      );
    }
  };

  const handleParticipants = (eventId: string) => {
    // Điều hướng hoặc hiển thị danh sách người tham gia
    sweetAlert.alertInfo(
      `Xem danh sách người tham gia cho sự kiện ID: ${eventId}`,
      "",
      1000,
      22
    );
  };

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

  useEffect(() => {
    fetchEvents(); // Fetch events khi selectedCategoryId thay đổi
  }, [selectedCategoryId]);

  // Mở dialog để thêm mới sự kiện
  const handleAddEvent = () => {
    setEditingEvent(null);
    setOpenDialog(true);
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
      const now = new Date();
      const startTime = new Date(selectedEvent.startTime);

      if (now > startTime) {
        sweetAlert.alertWarning(
          "Sự kiện đã bắt đầu, không thể chỉnh sửa!",
          "",
          1000,
          22
        );
        return;
      }

      setEditingEvent(selectedEvent);
      setOpenDialog(true);
    }
  };

  // Xử lý xóa sự kiện
  const handleDeleteEvent = async () => {
    if (selectedIds.length === 0) {
      sweetAlert.alertWarning("Vui lòng chọn sự kiện để xóa!", "", 1000, 22);
      return;
    }

    const now = new Date();
    const invalidEvents = rows.filter(
      (row) => selectedIds.includes(row.id) && new Date(row.startTime) <= now
    );

    if (invalidEvents.length > 0) {
      sweetAlert.alertWarning(
        "Một hoặc nhiều sự kiện đã bắt đầu, không thể xóa!",
        "",
        1000,
        22
      );
      return;
    }

    const confirm = await sweetAlert.confirm(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa ${selectedIds.length} sự kiện?`,
      "Xóa",
      "Hủy"
    );
    if (!confirm) return;

    try {
      await Promise.all(
        selectedIds.map((id) => eventApi.deleteEvent(id.toString()))
      );
      sweetAlert.alertSuccess("Xóa sự kiện thành công!", "", 1000, 22);
      fetchEvents();
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện:", error);
      sweetAlert.alertFailed("Không thể xóa sự kiện!", "", 1000, 22);
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Quản lý sự kiện
      </h1>
      <div className="my-2 flex justify-between mx-3">
        {/* Bộ lọc danh mục sự kiện */}
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Danh mục sự kiện</InputLabel>
          <Select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            label="Danh mục sự kiện"
          >
            <MenuItem value="Tất cả">Tất cả</MenuItem>
            {eventCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Các nút thêm, sửa, xóa */}
        <div className="space-x-2">
          <Button variant="contained" color="primary" onClick={handleAddEvent}>
            Thêm mới
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEditEvent}
          >
            Chỉnh sửa
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteEvent}>
            Xóa
          </Button>
          <Button onClick={fetchEvents} variant="contained" color="primary">
            Tải lại
          </Button>
        </div>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) =>
          setSelectedIds(newSelection)
        }
        localeText={viVNGridTranslation}
        sx={{
          border: 0,
        }}
      />
      {/* Dialog thêm/chỉnh sửa */}
      {openDialog && (
        <EventDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          event={editingEvent}
          refresh={fetchEvents}
        />
      )}
    </Paper>
  );
}
