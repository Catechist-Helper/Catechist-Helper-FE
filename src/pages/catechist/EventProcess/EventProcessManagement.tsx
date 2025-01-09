import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Select as MuiSelect,
  MenuItem,
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
import sweetAlert from "../../../utils/sweetAlert";
import {
  EventProcessStatus,
  EventProcessStringStatus,
  EventStatus,
  EventStatusString,
} from "../../../enums/Event";
import viVNGridTranslation from "../../../locale/MUITable";

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
  // const [summaryFees, setSummaryFees] = useState<number>(0);
  // const [actualSummaryFees, setActualSummaryFees] = useState<number>(0);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("");

  const fetchEventProcesses = async (init?: boolean) => {
    try {
      const response = await eventApi.getEventProcesses(eventId);
      if (init) {
        if (
          response.data.data.items.findIndex(
            (item) =>
              item.status != EventProcessStatus.Wait_Approval &&
              item.status != EventProcessStatus.Not_Approval
          ) >= 0
        ) {
          setCurrentStatusFilter("Đã phê duyệt");
        } else {
          setCurrentStatusFilter("Chờ phê duyệt");
        }
        return;
      } else {
        setEventProcesses(
          response.data.data.items
            .filter((item) => {
              if (currentStatusFilter == "Chờ phê duyệt") {
                return item.status == EventProcessStatus.Wait_Approval;
              }
              if (currentStatusFilter == "Đã phê duyệt") {
                return (
                  item.status != EventProcessStatus.Wait_Approval &&
                  item.status != EventProcessStatus.Not_Approval
                );
              }
              if (currentStatusFilter == "Không được duyệt") {
                return item.status == EventProcessStatus.Not_Approval;
              }
              return true;
            })
            .sort(
              (a: any, b: any) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
            )
        );
      }
      // let sumFees = 0;
      // let actualSumFees = 0;
      // response.data.data.items.forEach((item) => {
      //   if (
      //     item.status != EventProcessStatus.Cancelled &&
      //     item.status != EventProcessStatus.Wait_Approval &&
      //     item.status != EventProcessStatus.Not_Approval
      //   ) {
      //     if (item.fee) {
      //       sumFees += item.fee;
      //     }
      //     if (item.actualFee) {
      //       actualSumFees += item.actualFee;
      //     }
      //   }
      // });

      // setSummaryFees(sumFees);
      // setActualSummaryFees(actualSumFees);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu quá trình sự kiện:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStatusFilter != "") {
      fetchEventProcesses();
    }
  }, [currentStatusFilter]);

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
    fetchEventProcesses(true);
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

  const [viewMode, setViewMode] = useState<boolean>(false);
  const handleUpdateProcess = (
    process: ProcessResponseItem,
    viewDialogMode?: boolean
  ) => {
    setSelectedProcess(process); // Lấy thông tin process để cập nhật
    setOpenDialog(true); // Mở dialog để update
    if (viewDialogMode) {
      setViewMode(true);
    }
  };

  useEffect(() => {
    if (!openDialog) {
      setViewMode(false);
    }
  }, [openDialog]);
  console.log("aaaaa", eventProcesses);

  const handleDeleteProcess = async (processId: string) => {
    const confirmed = await sweetAlert.confirm(
      "Bạn có chắc chắn muốn xóa quá trình này?",
      "",
      "Xác nhận",
      "Hủy bỏ",
      "info"
    );
    if (confirmed) {
      try {
        await processApi.deleteProcess(processId);
        setEventProcesses(
          eventProcesses.filter((process) => process.id !== processId)
        ); // Xóa khỏi danh sách
      } catch (error) {
        console.error("Lỗi khi xóa quá trình:", error);
      } finally {
        fetchEventProcesses();
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProcess(null); // Reset selectedProcess khi đóng dialog
    setViewMode(false);
    fetchSelectedEvent();
    fetchEventProcesses();
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên hoạt động", width: 180 },
    // {
    //   field: "description",
    //   headerName: "Mô tả",
    //   width: 180,
    //   renderCell: (params) => (
    //     <div className="w-full h-full">
    //       <div dangerouslySetInnerHTML={{ __html: params.value }} />
    //     </div>
    //   ),
    // },
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
      width: 130,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>₫ {formatPrice(params.value)}</span>,
    },
    {
      field: "actualFee",
      headerName: "Chi phí thực tế",
      width: 130,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>₫ {formatPrice(params.value)}</span>,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      headerAlign: "center",
      align: "center",
      width: 150,
      renderCell: (params) => {
        switch (params.value) {
          case EventProcessStatus.Wait_Approval:
            return (
              <span className="rounded-xl py-1 px-2 bg-black text-white">
                {EventProcessStringStatus.Wait_Approval}
              </span>
            );
          case EventProcessStatus.Approval:
            return (
              <span className="rounded-xl py-1 px-2 bg-primary text-white">
                {EventProcessStringStatus.Approval}
              </span>
            );
          case EventProcessStatus.Not_Approval:
            return (
              <span className="rounded-xl py-1 px-2 bg-danger text-white">
                {EventProcessStringStatus.Not_Approval}
              </span>
            );
          case EventProcessStatus.In_Progress:
            return (
              <span className="rounded-xl py-1 px-2 bg-warning text-black">
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
    {
      field: "note",
      headerName: "Ghi chú",
      width: 180,
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: currentStatusFilter != "Không được duyệt" ? 280 : 100,
      renderCell: (params: any) => (
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() =>
              handleUpdateProcess(params.row as ProcessResponseItem, true)
            }
            style={{ marginRight: 10 }}
          >
            Xem
          </Button>
          {truongBTCRole &&
          params.row.status != EventProcessStatus.Completed &&
          params.row.status != EventProcessStatus.Cancelled &&
          params.row.status != EventProcessStatus.Not_Approval ? (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={() =>
                  handleUpdateProcess(params.row as ProcessResponseItem)
                }
                style={{ marginRight: 10 }}
              >
                Cập nhật
              </Button>
              {params.row.status == EventProcessStatus.Wait_Approval ? (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteProcess(params.id as string)}
                  >
                    Xóa
                  </Button>
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </Box>
      ),
    },
  ];

  if (currentStatusFilter != "Đã phê duyệt") {
    columns.splice(4, 1);
  }
  if (currentStatusFilter == "Không được duyệt") {
    columns.push({
      field: "comment",
      headerName: "Ghi chú phê duyệt",
      width: 180,
    });
  }

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

  const renderEventStatus = (value: number) => {
    switch (value) {
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
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        padding: "0 10px",
        left: "3.8rem",
      }}
    >
      {selectedEvent ? (
        <div className="w-full h-full px-3">
          <Typography variant="h5" gutterBottom>
            <Button
              onClick={() => {
                navigate(-1);
              }}
              style={{ marginRight: "15px" }}
              variant="outlined"
              color="primary"
              className="btn btn-primary"
            >
              Quay lại
            </Button>
            Các hoạt động của{" "}
            <strong>{selectedEvent ? selectedEvent.name : ""}</strong>
          </Typography>

          <div className="w-full flex flex-wrap">
            <div className="mt-2 w-[34%]">
              <strong>Mô tả sự kiện:</strong> {selectedEvent.description}
            </div>
            <div className="mt-2 w-[34%]">
              <strong>Trạng thái sự kiện:</strong>{" "}
              {renderEventStatus(selectedEvent.eventStatus)}
            </div>
            <div className="mt-2 w-[34%]">
              <strong>Thời gian bắt đầu sự kiện:</strong>{" "}
              {formatDate.DD_MM_YYYY(selectedEvent.startTime)}
            </div>
            <div className="mt-2 w-[34%]">
              <strong>Thời gian kết thúc sự kiện:</strong>{" "}
              {formatDate.DD_MM_YYYY(selectedEvent.endTime)}
            </div>
            <div className="mt-2 w-[100%]">
              <div className="w-[25%] flex justify-between">
                <div>
                  <strong>Tổng chi phí dự tính:</strong>{" "}
                </div>
                <div>
                  <strong>
                    <span> ₫ {formatPrice(selectedEvent.totalCost)}</span>
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-2 w-[100%]">
              <div className="w-[25%] flex justify-between">
                <div>
                  <strong>Tổng chi phí thực tế:</strong>{" "}
                </div>
                <div>
                  <strong>
                    <span> ₫ {formatPrice(selectedEvent.totalActualCost)}</span>
                  </strong>
                </div>
              </div>
            </div>
            <div className="mt-2 w-[100%]">
              <div className="w-[25%] flex justify-between">
                <div>
                  <strong> Tình trạng chi phí:</strong>
                </div>
                <div>
                  <strong>
                    <span
                      className={`${selectedEvent.surplusCost >= 0 ? "text-success" : "text-danger"}`}
                    >
                      {selectedEvent.surplusCost >= 0 ? "" : "-"} ₫{" "}
                      {formatPrice(
                        selectedEvent.surplusCost >= 0
                          ? selectedEvent.surplusCost
                          : -selectedEvent.surplusCost
                      )}
                    </span>
                  </strong>
                </div>
              </div>
            </div>
            {/* <div className="mt-2 w-[34%]">
                        <strong>
                          <div className="flex justify-between w-[70%]">
                            <p>Ngân sách hiện tại:</p>
                            <p> ₫ {formatPrice(selectedEvent.current_budget)}</p>
                          </div>
                        </strong>
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
                      </div> */}
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="w-full h-full mt-4 px-3 flex justify-between">
        <div className="min-w-[10px]">
          <div>
            <span className="mr-3 font-bold">Trạng thái phê duyệt</span>
            <MuiSelect
              labelId="result-label"
              value={currentStatusFilter}
              onChange={(e) => setCurrentStatusFilter(e.target.value)}
              className={`
               h-[40px] w-[200px]
              ${currentStatusFilter == "Chờ phê duyệt" ? "bg-black text-white" : ""}
              ${currentStatusFilter == "Đã phê duyệt" ? "bg-primary text-white" : ""}
              ${currentStatusFilter == "Không được duyệt" ? "bg-danger text-white" : ""}
              `}
            >
              <MenuItem
                value="Chờ phê duyệt"
                className="bg-black text-white py-2"
              >
                Chờ phê duyệt
              </MenuItem>
              <MenuItem
                value="Đã phê duyệt"
                className="bg-primary text-white py-2"
              >
                Đã phê duyệt
              </MenuItem>
              <MenuItem
                value="Không được duyệt"
                className="bg-danger text-white py-2"
              >
                Không được duyệt
              </MenuItem>
            </MuiSelect>
          </div>
        </div>
        <div className="flex gap-x-2">
          {truongBTCRole &&
          selectedEvent &&
          selectedEvent.eventStatus != EventStatus.Completed &&
          selectedEvent.eventStatus != EventStatus.Cancelled ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateProcess}
                style={{ marginBottom: "20px" }}
              >
                Tạo mới
              </Button>
            </>
          ) : (
            <></>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              fetchEventProcesses();
              fetchSelectedEvent();
            }}
            style={{ marginBottom: "20px" }}
          >
            Tải lại
          </Button>
        </div>
      </div>

      {/* {eventProcesses.length === 0 ? (
        <Typography>Không có hoạt động nào.</Typography>
      ) : ( */}
      <div className="w-full px-3">
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          paginationMode="client"
          sx={{
            height: 430,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          localeText={viVNGridTranslation}
        />
      </div>
      {/* )} */}
      {/* Event Process Dialog */}
      {openDialog ? (
        <>
          <EventProcessDialog
            open={openDialog}
            viewModeDialog={viewMode}
            onClose={handleCloseDialog}
            eventId={eventId}
            processData={selectedProcess}
            event={selectedEvent ? selectedEvent : undefined}
            truongBTCRole={truongBTCRole}
          />
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
};

export default EventProcessManagement;
