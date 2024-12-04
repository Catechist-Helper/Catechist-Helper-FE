import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import processApi from "../../../api/EventProcess";
import eventApi from "../../../api/Event";
import { formatDate } from "../../../utils/formatDate";
import {
  EventItemResponse,
  ProcessResponseItem,
} from "../../../model/Response/Event";
import EventProcessDialog from "./EventProcessDialog";
import { formatPrice } from "../../../utils/formatPrice";
import { RoleEventName } from "../../../enums/RoleEventEnum";

const EventProcessManagement: React.FC = () => {
  const location = useLocation();
  const eventId = location.state?.eventId as string;
  const userRole = location.state?.userRole as string;
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState<EventItemResponse | null>(
    null
  );
  const [eventProcesses, setEventProcesses] = useState<ProcessResponseItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [truongBTCRole, setTruongBTCRole] = useState<boolean>(false);
  const [selectedProcess, setSelectedProcess] =
    useState<ProcessResponseItem | null>(null);
  const [summaryFees, setSummaryFees] = useState<number>(0);

  const fetchEventProcesses = async () => {
    try {
      const response = await eventApi.getEventProcesses(eventId);
      setEventProcesses(
        response.data.data.items.sort(
          (a: any, b: any) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      );
      let sumFees = 0;
      console.log("res", response.data.data.items);
      response.data.data.items.forEach((item) => {
        if (item.fee) {
          sumFees += item.fee;
        }
      });
      setSummaryFees(sumFees);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu quá trình sự kiện:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedEvent = async () => {
    try {
      const response = await eventApi.getEventById(eventId);
      setSelectedEvent(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedEvent();
    fetchEventProcesses();
    if (userRole && userRole == RoleEventName.TRUONG_BTC) {
      setTruongBTCRole(true);
    }
  }, [eventId, userRole]);

  useEffect(() => {
    if (!openDialog) {
      fetchEventProcesses();
    }
  }, [openDialog]);

  const handleCreateProcess = () => {
    setSelectedProcess(null); // Đặt lại selectedProcess để tạo mới
    setOpenDialog(true); // Mở dialog tạo mới
  };

  const handleUpdateProcess = (process: ProcessResponseItem) => {
    setSelectedProcess(process); // Lấy thông tin process để cập nhật
    setOpenDialog(true); // Mở dialog để update
  };

  const handleDeleteProcess = async (processId: string) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa quá trình này?"
    );
    if (confirmed) {
      try {
        await processApi.deleteProcess(processId);
        setEventProcesses(
          eventProcesses.filter((process) => process.id !== processId)
        ); // Xóa khỏi danh sách
      } catch (error) {
        console.error("Lỗi khi xóa quá trình:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProcess(null); // Reset selectedProcess khi đóng dialog
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên hoạt động", width: 200 },
    { field: "description", headerName: "Mô tả", width: 300 },
    {
      field: "startTime",
      headerName: "Thời gian bắt đầu",
      width: 180,
      renderCell: (params) => formatDate.DD_MM_YYYY_Time(params.value),
    },
    {
      field: "endTime",
      headerName: "Thời gian kết thúc",
      width: 180,
      renderCell: (params) => formatDate.DD_MM_YYYY_Time(params.value),
    },
    {
      field: "fee",
      headerName: "Chi phí",
      width: 180,
      renderCell: (params) => formatPrice(params.value),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 200,
      renderCell: (params: any) => (
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() =>
              handleUpdateProcess(params.row as ProcessResponseItem)
            }
            style={{ marginRight: 10 }}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleDeleteProcess(params.id as string)}
          >
            Xóa
          </Button>
        </Box>
      ),
    },
  ];

  const rows: GridRowsProp = eventProcesses;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        padding: "0 10px",
      }}
    >
      {selectedEvent ? (
        <>
          <Typography variant="h5" gutterBottom>
            <Button
              onClick={() => {
                navigate(-1);
              }}
              style={{ marginRight: "20px" }}
              variant="outlined"
              color="inherit"
            >
              Quay lại
            </Button>
            Các hoạt động của{" "}
            <strong>{selectedEvent ? selectedEvent.name : ""}</strong>
          </Typography>
          <div className="w-full flex flex-wrap">
            <div className="w-[100%] flex flex-wrap">
              <div className="mt-2 w-[100%]">
                <strong>Mô tả sự kiện:</strong> {selectedEvent.description}
              </div>
              <div className="mt-2 w-[50%]">
                <strong>Thời gian bắt đầu:</strong>{" "}
                {formatDate.DD_MM_YYYY_Time(selectedEvent.startTime)}
              </div>
              <div className="mt-2 w-[50%]">
                <strong>Thời gian kết thúc:</strong>{" "}
                {formatDate.DD_MM_YYYY_Time(selectedEvent.endTime)}
              </div>
            </div>
            <div className="mt-2 w-[100%]">
              <strong>
                Ngân sách hiện tại: ₫{" "}
                {formatPrice(selectedEvent.current_budget)}
              </strong>
            </div>{" "}
            <div className="mt-2 w-[100%]">
              <strong>
                Tổng chi phí hiện tại: ₫ {formatPrice(summaryFees)}
              </strong>
            </div>
            <div className="mt-2 w-[100%]">
              <strong>Tình trạng: ₫</strong>{" "}
              {selectedEvent.current_budget - summaryFees >= 0 ? (
                <>
                  <span className="font-bold text-success">
                    Dư {formatPrice(selectedEvent.current_budget - summaryFees)}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold text-danger">
                    Thiếu{" "}
                    {formatPrice(summaryFees - selectedEvent.current_budget)}
                  </span>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      {truongBTCRole ? (
        <>
          <div className="flex gap-x-2 mt-3 justify-end">
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCreateProcess}
              style={{ marginBottom: "20px" }}
            >
              Tạo quá trình
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchEventProcesses}
              style={{ marginBottom: "20px" }}
            >
              Tải lại
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}

      {eventProcesses.length === 0 ? (
        <Typography>Không có quá trình nào cho sự kiện này.</Typography>
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} />
        </div>
      )}
      {/* Event Process Dialog */}
      <EventProcessDialog
        open={openDialog}
        onClose={handleCloseDialog}
        eventId={eventId}
        processData={selectedProcess}
      />
    </Paper>
  );
};

export default EventProcessManagement;
