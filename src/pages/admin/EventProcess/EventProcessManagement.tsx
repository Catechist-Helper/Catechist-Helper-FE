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
import {
  EventProcessStatus,
  EventProcessStringStatus,
} from "../../../enums/Event";

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
  const [actualSummaryFees, setActualSummaryFees] = useState<number>(0);

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
      let actualSumFees = 0;
      response.data.data.items.forEach((item) => {
        if (item.status != EventProcessStatus.Cancelled) {
          if (item.fee) {
            sumFees += item.fee;
          }
          if (item.actualFee) {
            actualSumFees += item.actualFee;
          }
        }
      });
      setSummaryFees(sumFees);
      setActualSummaryFees(actualSumFees);
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
      headerName: "Chi phí dự tính",
      width: 150,
      renderCell: (params) => formatPrice(params.value),
    },
    {
      field: "actualFee",
      headerName: "Chi phí thực tế",
      width: 150,
      renderCell: (params) => formatPrice(params.value),
    },
    {
      field: "note",
      headerName: "Ghi chú",
      width: 180,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 180,
      renderCell: (params) => {
        switch (params.value) {
          case EventProcessStatus.Not_Started:
            return (
              <span className="rounded-xl py-1 px-2 bg-warning text-black">
                {EventProcessStringStatus.Not_Started}
              </span>
            );
          case EventProcessStatus.In_Progress:
            return (
              <span className="rounded-xl py-1 px-2 bg-primary text-white">
                {EventProcessStringStatus.In_Progress}
              </span>
            );
          case EventProcessStatus.Completed:
            return (
              <span className="rounded-xl py-1 px-2 bg-success text-white">
                {EventProcessStringStatus.Completed}
              </span>
            );
          case EventProcessStatus.Cancelled:
            return (
              <span className="rounded-xl py-1 px-2 bg-danger text-white">
                {EventProcessStringStatus.Cancelled}
              </span>
            );
          default:
            return <></>;
        }
      },
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
            <div className="mt-2 w-[100%]">
              <strong>Mô tả sự kiện:</strong> {selectedEvent.description}
            </div>
            <div className="mt-2 w-[34%]">
              <strong>Thời gian bắt đầu:</strong>{" "}
              {formatDate.DD_MM_YYYY(selectedEvent.startTime)}
            </div>
            <div className="mt-2 w-[34%]">
              <strong>Thời gian kết thúc:</strong>{" "}
              {formatDate.DD_MM_YYYY(selectedEvent.endTime)}
            </div>
            <div className="mt-2 w-[100%]">
              <div className="w-[34%]">
                <strong>
                  <div className="flex justify-between w-[70%]">
                    <p>Ngân sách hiện tại:</p>
                    <p> ₫ {formatPrice(selectedEvent.current_budget)}</p>
                  </div>
                </strong>
              </div>
            </div>
            <div className="mt-2 w-[34%]">
              <strong>
                <div className="flex justify-between w-[70%]">
                  <p>Tổng chi phí dự tính:</p>
                  <p> ₫ {formatPrice(summaryFees)}</p>
                </div>
              </strong>
            </div>
            <div className="mt-2 w-[34%]">
              <strong>
                <div className="flex justify-between w-[70%]">
                  <p>Tổng chi phí thực tế:</p>
                  <p> ₫ {formatPrice(actualSummaryFees)}</p>
                </div>
              </strong>
            </div>
            <div className="mt-2 w-[34%]">
              <strong>
                <div className="flex justify-between w-[70%]">
                  <p>{"Tình trạng số dư (dự tính):"}</p>
                  <p>
                    {selectedEvent.current_budget - summaryFees >= 0 ? (
                      <>
                        <span className="font-bold text-success">
                          Dư ₫{" "}
                          {formatPrice(
                            selectedEvent.current_budget - summaryFees
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-danger">
                          Thiếu{" "}
                          {formatPrice(
                            summaryFees - selectedEvent.current_budget
                          )}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </strong>
            </div>
            <div className="mt-2 w-[34%]">
              <strong>
                <div className="flex justify-between w-[70%]">
                  <p>{"Tình trạng số dư (thực tế):"}</p>
                  <p>
                    {selectedEvent.current_budget - actualSummaryFees >= 0 ? (
                      <>
                        <span className="font-bold text-success">
                          Dư ₫{" "}
                          {formatPrice(
                            selectedEvent.current_budget - actualSummaryFees
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-danger">
                          Thiếu{" "}
                          {formatPrice(
                            actualSummaryFees - selectedEvent.current_budget
                          )}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </strong>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      <div className="flex gap-x-2 mt-3 justify-end">
        <Button
          variant="contained"
          color="primary"
          onClick={fetchEventProcesses}
          style={{ marginBottom: "20px" }}
        >
          Tải lại
        </Button>
      </div>

      <div className="w-full mt-3">
        {eventProcesses.length === 0 ? (
          <Typography>Không có quá trình nào cho sự kiện này.</Typography>
        ) : (
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              paginationMode="client"
            />
          </div>
        )}
      </div>
    </Paper>
  );
};

export default EventProcessManagement;
