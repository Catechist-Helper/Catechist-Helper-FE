import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  Paper,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridRowsProp,
} from "@mui/x-data-grid";
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
  EventStatus,
  EventStatusString,
} from "../../../enums/Event";
import EventProcessDialog from "../../catechist/EventProcess/EventProcessDialog";
import sweetAlert from "../../../utils/sweetAlert";
import processApi from "../../../api/EventProcess";
import Swal from "sweetalert2";
import useAppContext from "../../../hooks/useAppContext";
import viVNGridTranslation from "../../../locale/MUITable";

const EventProcessManagement: React.FC = () => {
  const location = useLocation();
  const eventId = location.state?.eventId as string;
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItemResponse | null>(
    null
  );
  const [eventProcesses, setEventProcesses] = useState<ProcessResponseItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  // const [summaryFees, setSummaryFees] = useState<number>(0);
  // const [actualSummaryFees, setActualSummaryFees] = useState<number>(0);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("");

  const fetchEventProcesses = async (init?: boolean) => {
    try {
      const response = await eventApi.getEventProcesses(eventId);
      if (init) {
        if (
          response.data.data.items.findIndex(
            (item) => item.status == EventProcessStatus.Wait_Approval
          ) >= 0
        ) {
          setCurrentStatusFilter("Chờ phê duyệt");
          sweetAlert.alertInfo(
            "Hiện tại có hoạt động cần được phê duyệt",
            "",
            7000,
            30
          );
        } else {
          setCurrentStatusFilter("Đã phê duyệt");
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
  }, [eventId]);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedProcess, setSelectedProcess] =
    useState<ProcessResponseItem | null>(null);
  const handleViewProcess = (process: ProcessResponseItem) => {
    setSelectedProcess(process);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProcess(null);
  };
  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên hoạt động", width: 180 },
    // {
    //   field: "description",
    //   headerName: "Mô tả",
    //   width: 180,
    //   renderCell: (params) => (
    //     <div className="w-full h-full">
    //       <div dangerouslySetInnerHTML={{ __html: params.value }} />f
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
      // headerAlign: "center",
      // align: "center",
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
      width: currentStatusFilter != "Không được duyệt" ? 250 : 100,
      renderCell: (params: any) => (
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            className="hover:bg-purple-800 hover:text-white hover:border-purple-800 ml-1"
            onClick={() => handleViewProcess(params.row as ProcessResponseItem)}
            style={{ marginRight: 10 }}
          >
            Xem
          </Button>
          {params.row.status == EventProcessStatus.Wait_Approval &&
          selectedEvent &&
          selectedEvent.eventStatus == EventStatus.In_Progress ? (
            <>
              <Button
                variant="outlined"
                color="success"
                className="btn btn-success"
                onClick={() => {
                  handleApprove(params.row.id, params.row.name, true);
                }}
                style={{ marginRight: 10 }}
              >
                Duyệt
              </Button>
              <Button
                variant="outlined"
                color="error"
                className="btn btn-danger"
                onClick={() => {
                  handleApprove(params.row.id, params.row.name, false);
                }}
                style={{ marginRight: 10 }}
              >
                Hủy
              </Button>
            </>
          ) : (
            <></>
          )}
        </Box>
      ),
    },
  ];
  const { enableLoading, disableLoading } = useAppContext();
  const handleApprove = async (
    id: string,
    name: string,
    isApproved: boolean,
    multiple?: boolean
  ) => {
    if (multiple) {
      const confirm = await sweetAlert.confirm(
        `Xác nhận phê duyệt </br> ${selectedIds.length} hoạt động`,
        "",
        "Xác nhận",
        "Hủy bỏ",
        "success"
      );
      if (!confirm) {
        return;
      }
      try {
        enableLoading();
        const thePromises = selectedIds.map(async (id) => {
          await processApi.approveProcess(id.toString(), {
            comment: "",
            status: isApproved
              ? EventProcessStatus.Approval
              : EventProcessStatus.Not_Approval,
          });
        });

        await Promise.all(thePromises);
        if (isApproved) {
          sweetAlert.alertSuccess("Phê duyệt thành công");
        } else {
          sweetAlert.alertSuccess("Hủy bỏ thành công");
        }
        fetchEventProcesses();
        fetchSelectedEvent();
      } catch (error: any) {
        console.error("Lỗi:", error);
        if (isApproved) {
          sweetAlert.alertFailed("Có lôi khi phê duyệt");
        } else {
          sweetAlert.alertFailed("Có lôi khi hủy bỏ");
        }
      } finally {
        disableLoading();
      }
      return;
    }
    const confirm = await sweetAlert.confirm(
      "",
      `<p style="font-size:1.8rem">Xác nhận ${isApproved ? "phê duyệt" : "hủy bỏ"} hoạt động <strong>${name}?</strong></p>`,
      undefined,
      undefined,
      isApproved ? "success" : "error"
    );
    if (confirm) {
      if (isApproved) {
        try {
          enableLoading();
          await processApi.approveProcess(id, {
            comment: "",
            status: isApproved
              ? EventProcessStatus.Approval
              : EventProcessStatus.Not_Approval,
          });
          if (isApproved) {
            sweetAlert.alertSuccess("Phê duyệt thành công");
          } else {
            sweetAlert.alertSuccess("Hủy bỏ thành công");
          }
          fetchEventProcesses();
          fetchSelectedEvent();
        } catch (error) {
          console.error("Lỗi:", error);
          if (isApproved) {
            sweetAlert.alertFailed("Có lôi khi phê duyệt");
          } else {
            sweetAlert.alertFailed("Có lôi khi hủy bỏ");
          }
        } finally {
          disableLoading();
        }
        return;
      }

      Swal.fire({
        title: isApproved ? "Nhập ghi chú phê duyệt" : "Nhập ghi chú hủy bỏ",
        input: "text",
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy bỏ",
        showLoaderOnConfirm: true,
        preConfirm: async (value) => {
          return value;
        },
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          const action = async () => {
            try {
              enableLoading();
              await processApi.approveProcess(id, {
                comment: result.value,
                status: isApproved
                  ? EventProcessStatus.Approval
                  : EventProcessStatus.Not_Approval,
              });
              if (isApproved) {
                sweetAlert.alertSuccess("Phê duyệt thành công");
              } else {
                sweetAlert.alertSuccess("Hủy bỏ thành công");
              }
              fetchEventProcesses();
              fetchSelectedEvent();
            } catch (error) {
              console.error("Lỗi:", error);
              if (isApproved) {
                sweetAlert.alertFailed("Có lôi khi phê duyệt");
              } else {
                sweetAlert.alertFailed("Có lôi khi hủy bỏ");
              }
            } finally {
              disableLoading();
            }
          };
          action();
        } else {
          handleApprove(id, name, isApproved);
        }
      });
    }
  };

  if (currentStatusFilter != "Đã phê duyệt") {
    columns.splice(6, 1);
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
          <span className="rounded-xl px-2 py-[2px] bg-black text-white">
            {EventStatusString.Not_Started}
          </span>
        );
      case EventStatus.In_Progress:
        return (
          <span className="rounded-xl px-2 py-[2px] bg-warning text-black">
            {EventStatusString.In_Progress}
          </span>
        );
      case EventStatus.Completed:
        return (
          <span className="rounded-xl px-2 py-[2px] bg-success text-white">
            {EventStatusString.Completed}
          </span>
        );
      case EventStatus.Cancelled:
        return (
          <span className="rounded-xl px-2 py-[2px] bg-danger text-white">
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
              className=" border-black bg-white text-black hover:!text-white hover:!bg-black"
            >
              Quay lại
            </Button>
            <span className="text-black">
              Các hoạt động của{" "}
              <strong>{selectedEvent ? selectedEvent.name : ""}</strong>
            </span>
          </Typography>

          <div className="w-full flex flex-wrap">
            <div className="mt-2 w-[40%]">
              <h1 className="text-[1.3rem] text-black font-bold mt-1 mb-3">
                Thông tin của sự kiện
              </h1>
              <div className="mt-2" style={{ transform: "translateX(2px)" }}>
                <strong>Mô tả sự kiện:</strong> {selectedEvent.description}
              </div>
              <div className="mt-2">
                <strong>Thời gian sự kiện:</strong>{" "}
                {formatDate.DD_MM_YYYY(selectedEvent.startTime)} {" - "}
                {formatDate.DD_MM_YYYY(selectedEvent.endTime)}
              </div>
              <div className="mt-2">
                <strong>Trạng thái sự kiện:</strong>{" "}
                {renderEventStatus(selectedEvent.eventStatus)}
              </div>
            </div>
            <div className="mt-2 w-[40%]">
              <h1 className="text-[1.3rem] text-black font-bold mt-1 mb-3">
                Thông tin chi phí sự kiện
              </h1>
              <div className="mt-2 w-[100%]">
                <div className="w-[55%] flex justify-between">
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
                <div className="w-[55%] flex justify-between">
                  <div>
                    <strong>Tổng chi phí thực tế:</strong>{" "}
                  </div>
                  <div>
                    <strong>
                      <span>
                        {" "}
                        ₫ {formatPrice(selectedEvent.totalActualCost)}
                      </span>
                    </strong>
                  </div>
                </div>
              </div>
              <div className="mt-2 w-[100%]">
                <div className="w-[55%] flex justify-between">
                  <div>
                    <strong> Tình trạng số dư:</strong>
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
            </div>
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
        <div className="">
          {selectedIds.length >= 1 &&
          currentStatusFilter == "Chờ phê duyệt" &&
          selectedEvent &&
          selectedEvent.eventStatus == EventStatus.In_Progress ? (
            <>
              <Button
                variant="contained"
                color="success"
                sx={{ marginRight: "5px" }}
                onClick={() => {
                  handleApprove("", "", true, true);
                }}
                style={{ marginBottom: "20px" }}
              >
                Duyệt
              </Button>
            </>
          ) : (
            <></>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              fetchEventProcesses(true);
              fetchSelectedEvent();
            }}
            style={{ marginBottom: "20px" }}
          >
            Tải lại
          </Button>
        </div>
      </div>

      <div className="w-full mt-1">
        {/* {eventProcesses.length === 0 ? (
          <Typography>Không có hoạt động nào.</Typography>
        ) : ( */}
        <div className="px-3 w-full">
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            paginationMode="client"
            sx={{
              height: 400,
              overflowX: "auto",
              "& .MuiDataGrid-root": {
                overflowX: "auto",
              },
            }}
            checkboxSelection={currentStatusFilter == "Chờ phê duyệt"}
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={setSelectedIds}
            localeText={viVNGridTranslation}
          />
        </div>
        {/* )} */}
      </div>
      {openDialog ? (
        <>
          <EventProcessDialog
            open={openDialog}
            viewModeDialog={true}
            onClose={handleCloseDialog}
            eventId={eventId}
            processData={selectedProcess}
            event={selectedEvent ? selectedEvent : undefined}
          />
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
};

export default EventProcessManagement;
