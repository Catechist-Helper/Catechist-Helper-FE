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
import eventApi from "../../../api/Event";
import { formatDate } from "../../../utils/formatDate";
import {
  EventItemResponse,
  ProcessResponseItem,
} from "../../../model/Response/Event";
import { formatPrice } from "../../../utils/formatPrice";

const EventProcessManagement: React.FC = () => {
  const location = useLocation();
  const eventId = location.state?.eventId as string;
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState<EventItemResponse | null>(
    null
  );
  const [eventProcesses, setEventProcesses] = useState<ProcessResponseItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
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
  }, [eventId]);

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
            Các hoạt động của sự kiện{" "}
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
      {eventProcesses.length === 0 ? (
        <Typography>Không có quá trình nào cho sự kiện này.</Typography>
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} />
        </div>
      )}
    </Paper>
  );
};

export default EventProcessManagement;
