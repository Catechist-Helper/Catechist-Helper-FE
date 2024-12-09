import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Modal,
  Button,
  Select as MuiSelect,
  MenuItem,
  TextField,
  FormControl,
} from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";
import RegistrationDetailDialog from "./RegistrationDetailDialog";
import Select from "react-select";
import dayjs from "dayjs";
import registrationApi from "../../../api/Registration";
import interviewApi from "../../../api/Interview";
import interviewProcessApi from "../../../api/InterviewProcess";
import accountApi from "../../../api/Account";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import sweetAlert from "../../../utils/sweetAlert";
import { formatDate } from "../../../utils/formatDate";
import { AccountRoleString } from "../../../enums/Account";
import useAppContext from "../../../hooks/useAppContext";
import CreateAccountAndCatechistDialog from "./CreateAccountAndCatechistDialog";
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";
import { RoleNameEnum } from "../../../enums/RoleEnum";
import CkEditor from "../../../components/ckeditor5/CkEditor";

// import { RegistrationProcessTitle } from "../../../enums/RegistrationProcess";

// Cấu hình các cột trong DataGrid
const columns: GridColDef[] = [
  { field: "fullName", headerName: "Tên đầy đủ", width: 180 },
  { field: "gender", headerName: "Giới tính", width: 100 },
  {
    field: "dateOfBirth",
    headerName: "Ngày sinh",
    width: 110,
    renderCell: (params) => {
      return formatDate.DD_MM_YYYY(params.value); // Format ngày tháng
    },
  },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Số điện thoại", width: 120 },
  { field: "address", headerName: "Địa chỉ", width: 180 },
  {
    field: "isTeachingBefore",
    headerName: "Đã từng dạy",
    width: 120,
    renderCell: (params) => (params.value ? "Có" : "Không"),
  },
  { field: "yearOfTeaching", headerName: "Số năm giảng dạy", width: 150 },
  {
    field: "meetingTime",
    headerName: "Thời gian phỏng vấn",
    width: 180,
    renderCell: (params) => {
      return params.row.interview
        ? formatDate.DD_MM_YYYY_Time(params.row.interview.meetingTime)
        : "Chưa có lịch";
    },
    sortComparator: (a, b) => {
      if (!a || !b) return 0;
      return dayjs(a).isBefore(dayjs(b)) ? -1 : 1; // Sắp xếp theo ngày giờ từ sớm tới muộn
    },
  },
  {
    field: "interviewType",
    headerName: "Hình thức",
    width: 100,
    renderCell: (params) => {
      return params.row.interview && params.row.interview.interviewType == 1 ? (
        <span className="text-white bg-success rounded-xl py-1 px-2">
          Online
        </span>
      ) : (
        <span className="text-white bg-black rounded-xl py-1 px-2">
          Trực tiếp
        </span>
      );
    },
    sortComparator: (a, b) => {
      if (!a || !b) return 0;
      return dayjs(a).isBefore(dayjs(b)) ? -1 : 1; // Sắp xếp theo ngày giờ từ sớm tới muộn
    },
  },
  {
    field: "interview.recruiters",
    headerName: "Người phỏng vấn",
    width: 200,
    renderCell: (params) => {
      return params.row.interview.recruiters
        ? params.row.interview.recruiters
            .map((recruiter: any) => recruiter.fullName)
            .join(", ")
        : "";
    },
  },

  {
    field: "note",
    headerName: "Ghi chú",
    width: 200,
  },
  // {
  //   field: "interviews",
  //   headerName: "Kết quả phỏng vấn",
  //   width: 200,
  //   renderCell: (params) => {
  //     return params.row.interview?.note || ""; // Hiển thị ghi chú nếu có
  //   },
  // },
  {
    field: "status",
    headerName: "Trạng thái",
    width: 150,
    renderCell: (params) => {
      const status = params.value as RegistrationStatus;
      switch (status) {
        case RegistrationStatus.Approved_Duyet_Don:
          return (
            <span className="inline px-2 py-1 bg-info text-text_primary_dark rounded-lg">
              Chờ phỏng vấn
            </span>
          );
        case RegistrationStatus.Approved_Phong_Van:
          return (
            <span className="inline px-2 py-1 bg-success text-text_primary_light rounded-lg">
              Đã chấp nhận
            </span>
          );
        case RegistrationStatus.Rejected_Phong_Van:
          return (
            <span className="inline px-2 py-1 bg-danger rounded-lg text-text_primary_light">
              Bị từ chối
            </span>
          );
        default:
          return "Không xác định";
      }
    },
    // renderCell: () => {
    //   return (
    //     <span className="inline px-2 py-1 bg-info rounded-lg">
    //       Chờ phỏng vấn
    //     </span>
    //   );
    // },
  },
];

// Hàm chính để hiển thị danh sách đơn
export default function ApprovedRegistrationsTable() {
  const { enableLoading, disableLoading } = useAppContext();
  const [rows, setRows] = useState<RegistrationItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedRegistrations, setSelectedRegistrations] =
    useState<GridRowSelectionModel>([]); // Chọn nhiều đơn

  // Modal state cho phê duyệt phỏng vấn
  const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
  const [interviewNote, setInterviewNote] = useState<string>(""); // Ghi chú phỏng vấn
  const [interviewResult, setInterviewResult] = useState<string>(""); // Kết quả phỏng vấn
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationItemResponse | null>(null); // Đơn đăng ký được chọn
  const [selectedRegistrationOfModal, setSelectedRegistrationOfModal] =
    useState<RegistrationItemResponse | null>(null);

  // Modal state cho cập nhật phỏng vấn
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  // const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedRecruiters, setSelectedRecruiters] = useState<any[]>([]);
  const [meetingTime, setMeetingTime] = useState<string>("");
  const [recruiters, setRecruiters] = useState<any[]>([]); // Lưu danh sách recruiter
  const [updatedInterviewReason, setUpdatedInterviewReason] =
    useState<string>("");
  // const [deletedInterviewReason, setDeletedInterviewReason] =
  //   useState<string>("");

  // State cho loại đơn hiện tại
  const [currentFilter, setCurrentFilter] = useState<
    "waiting" | "accepted" | "rejected"
  >("waiting");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDialogRegisDetail, setOpenDialogRegisDetail] =
    useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);

  // Lấy danh sách accounts (recruiters)
  const fetchRecruiters = async () => {
    try {
      const { data } = await accountApi.getAllAccounts(1, 10000);
      setRecruiters(
        data.data.items.filter(
          (item: any) => item.role.roleName == RoleNameEnum.Catechist
        )
      );
    } catch (error) {
      console.error("Lỗi khi tải danh sách accounts:", error);
    }
  };

  // Fetch các đơn đã duyệt dựa trên trạng thái và lọc theo ngày
  const fetchApprovedRegistrations = async (
    deleteModeOn?: boolean | string
  ) => {
    try {
      setLoading(true);

      // Xác định giá trị status dựa trên bộ lọc hiện tại
      let status;
      switch (currentFilter) {
        case "accepted":
          status = RegistrationStatus.Approved_Phong_Van;
          break;
        case "rejected":
          status = RegistrationStatus.Rejected_Phong_Van;
          break;
        default:
          status = RegistrationStatus.Approved_Duyet_Don;
          break;
      }

      // Gọi API getAllRegistrations với các tham số
      const firstResponse = await registrationApi.getAllRegistrations(
        undefined,
        undefined,
        status
      );

      const { data } = await registrationApi.getAllRegistrations(
        undefined,
        undefined,
        status,
        1,
        firstResponse.data.data.total
      );

      let finalData = data.data.items
        .sort((a: RegistrationItemResponse, b: RegistrationItemResponse) => {
          if (
            a.interview &&
            a.interview.meetingTime &&
            b.interview &&
            b.interview.meetingTime
          ) {
            return (
              new Date(a.interview.meetingTime).getTime() -
              new Date(b.interview.meetingTime).getTime()
            );
          }
          return -1;
        })
        .filter((item: RegistrationItemResponse) => {
          if (
            selectedDate &&
            selectedDate != "" &&
            item.interview &&
            item.interview.meetingTime
          ) {
            return (
              formatDate.DD_MM_YYYY(item.interview.meetingTime) ==
              formatDate.DD_MM_YYYY(selectedDate)
            );
          }
          return true;
        });

      finalData =
        (deleteModeOn === true || deleteMode) && deleteModeOn != "false"
          ? [...finalData].filter(
              (item) =>
                Number(formatDate.YYYY(item.createdAt)) <
                Number(
                  formatDate.YYYY(formatDate.getISODateInVietnamTimeZone())
                )
            )
          : [...finalData];

      setRowCount(finalData.length);
      setRows(finalData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchApprovedRegistrations();
  };

  useEffect(() => {
    handleRefresh();
  }, [openDialog]);

  // Gọi API khi component được render
  useEffect(() => {
    fetchApprovedRegistrations();
  }, [selectedDate, currentFilter]);

  useEffect(() => {
    setSelectedRegistrations([]);
  }, [currentFilter]);

  // Xử lý khi thay đổi các lựa chọn trong bảng
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRegistrations(newSelectionModel);
  };

  const fetchSelectedRegistrationOfModal = async () => {
    await registrationApi
      .getRegistrationById(selectedRegistrations[0].toString())
      .then((res) => {
        setSelectedRegistrationOfModal(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Mở modal phê duyệt phỏng vấn
  const handleOpenApprovalModal = (registrationId: string) => {
    const selectedRow = rows.find((row) => row.id === registrationId);

    if (!selectedRow || !selectedRow.interview) {
      sweetAlert.alertFailed(
        "Không tìm thấy thông tin phỏng vấn!",
        "",
        1000,
        22
      );
      return;
    }

    const meetingTime = new Date(selectedRow.interview.meetingTime);
    const currentTime = new Date();

    if (currentTime < meetingTime) {
      sweetAlert.alertFailed(
        `Chưa đến thời điểm phỏng vấn. Vui lòng quay lại sau ${formatDate.DD_MM_YYYY_Time(
          selectedRow.interview.meetingTime
        )}`,
        "",
        10000,
        30
      );
      return;
    }

    if (selectedRow) {
      setSelectedRegistration(selectedRow);
      fetchSelectedRegistrationOfModal();
      setOpenApprovalModal(true);
    }
  };

  const handleCloseApprovalModal = () => {
    setSelectedRegistrationOfModal(null);
    setOpenApprovalModal(false);
    setInterviewNote(""); // Reset các trường input
    setInterviewResult("");
  };
  console.log(rows);
  // Mở modal cập nhật phỏng vấn
  const handleOpenUpdateModal = (registrationId: string) => {
    const selectedRow = rows.find((row) => row.id === registrationId);
    if (selectedRow) {
      setSelectedRegistration(selectedRow);
      fetchSelectedRegistrationOfModal();
      setSelectedRecruiters(
        selectedRow.interview.recruiters.map((recruiter: any) => ({
          value: recruiter.id,
          label: `${recruiter.fullName} ${recruiter.role && recruiter.role.roleName.toUpperCase() == AccountRoleString.ADMIN ? " - Admin" : ""} ${recruiter.role && recruiter.role.roleName.toUpperCase() == AccountRoleString.MANAGER ? " - Quản lý" : ""} ${recruiter.role && recruiter.role.roleName.toUpperCase() == AccountRoleString.CATECHIST ? " - Giáo lý viên" : ""}`,
        }))
      );
      setMeetingTime(
        selectedRow.interview ? selectedRow.interview.meetingTime : ""
      );
      fetchRecruiters(); // Gọi API lấy danh sách recruiters
      setOpenUpdateModal(true);
    }
  };

  const handleCloseUpdateModal = () => {
    setSelectedRegistrationOfModal(null);
    setOpenUpdateModal(false);
    setSelectedRecruiters([]);
    setMeetingTime("");
  };

  // Mở modal xóa phỏng vấn
  // const handleOpenDeleteModal = () => {
  //   fetchSelectedRegistrationOfModal();
  //   setOpenDeleteModal(true);
  // };

  // const handleCloseDeleteModal = () => {
  //   setSelectedRegistrationOfModal(null);
  //   setOpenDeleteModal(false);
  // };

  // Xác nhận phỏng vấn
  const handleConfirmInterview = async () => {
    enableLoading();
    if (!interviewResult) {
      alert("Vui lòng chọn kết quả phỏng vấn.");
      disableLoading();
      return;
    }

    const isPassed = interviewResult === "Chấp nhận";
    const registrationStatus = isPassed
      ? RegistrationStatus.Approved_Phong_Van
      : RegistrationStatus.Rejected_Phong_Van;

    try {
      if (selectedRegistration) {
        await registrationApi.updateRegistration(selectedRegistration.id, {
          status: registrationStatus,
        });

        const interviewId = selectedRegistration.interview?.id;
        if (interviewId) {
          await interviewApi.updateInterview(interviewId, {
            meetingTime: null,
            note: interviewNote,
            isPassed,
          });
        }

        let processRes = await interviewProcessApi.createInterviewProcess({
          registrationId: selectedRegistration.id,
          name: RegistrationProcessTitle.PHONG_VAN,
        });

        await interviewProcessApi.updateInterviewProcess(
          processRes.data.data.id,
          {
            name: RegistrationProcessTitle.PHONG_VAN,
            status: isPassed
              ? RegistrationProcessStatus.Approved
              : RegistrationProcessStatus.Rejected,
          }
        );

        handleCloseApprovalModal();
        setSelectedRegistrations([]);
        sweetAlert.alertSuccess("Phê duyệt thành công", "", 1000, 20);
        fetchApprovedRegistrations();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật phỏng vấn:", error);
    } finally {
      disableLoading();
    }
    disableLoading();
  };

  // Xác nhận cập nhật phỏng vấn
  const handleUpdateInterview = async () => {
    if (!updatedInterviewReason || updatedInterviewReason.trim() == "") {
      sweetAlert.alertFailed(
        "Lý do cập nhật lịch đang bị trống",
        "Vui lòng nhập lý do để tiếp tục",
        10000,
        27
      );
      return;
    }
    enableLoading();
    try {
      if (selectedRegistration) {
        const interviewId = selectedRegistration.interview?.id;
        if (interviewId) {
          await interviewApi.updateInterview(interviewId, {
            meetingTime,
            note: selectedRegistration.interview.note,
            isPassed: selectedRegistration.interview.isPassed,
            reason: updatedInterviewReason,
            accounts: selectedRecruiters.map((rec: any) => rec.value),
          });
        }

        handleCloseUpdateModal();
        sweetAlert.alertSuccess("Cập nhật thành công", "", 1000, 20);
        setSelectedRegistrations([]);
        fetchApprovedRegistrations();
        setUpdatedInterviewReason("");
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật phỏng vấn:", error);
      if (error && error.message) {
        if (
          error.message.toString().toLowerCase().includes("scheduled at least")
        ) {
          sweetAlert.alertFailed(
            "Lỗi khi xếp lịch phỏng vấn",
            `Lịch phỏng vấn phải cách ngày hiện tại ít nhất ${error.message.split("scheduled at least ")[1].split(" ")[0].trim()} ngày`,
            10000,
            24
          );
        }
      }
    } finally {
      disableLoading();
    }
  };

  // const handleDeleteInterview = async () => {
  //   // enableLoading();
  //   if (selectedRegistrations.length === 0) return;

  //   for (let registrationId of selectedRegistrations) {
  //     const selectedRow = rows.find((row) => row.id === registrationId);

  //     if (!selectedRow || selectedRow.interview) {
  //       console.error("Không tìm thấy phỏng vấn để xóa.");
  //       continue;
  //     }

  //     const interviewId = selectedRow.interview.id; // Lấy id của interview

  //     try {
  //       // Xóa interview của đơn đăng ký
  //       await interviewApi.deleteInterview(interviewId);

  //       // if (selectedRow.interviewProcesses) {
  //       //   // Cập nhật status của Interview Process
  //       //   const interviewProcessId = selectedRow.interviewProcesses.filter(
  //       //     (process: any) =>
  //       //       process.name.startsWith(RegistrationProcessTitle.DUYET_DON)
  //       //   )[0]?.id;
  //       //   if (interviewProcessId) {
  //       //     await interviewProcessApi.updateInterviewProcess(
  //       //       interviewProcessId,
  //       //       {
  //       //         name: RegistrationProcessTitle.DUYET_DON,
  //       //         status: 0,
  //       //       }
  //       //     );
  //       //   }
  //       // }

  //       // Cập nhật trạng thái đơn đăng ký thành Pending
  //       await registrationApi.updateRegistration(registrationId.toString(), {
  //         status: RegistrationStatus.Pending,
  //       });
  //       setSelectedRegistrations([]);
  //     } catch (error) {
  //       console.error("Lỗi khi xóa phỏng vấn:", error);
  //     } finally {
  //       disableLoading();
  //     }
  //   }

  //   // Tải lại danh sách sau khi xóa
  //   fetchApprovedRegistrations();
  // };

  // Xử lý hiển thị các nút khi lọc
  const renderFilterButtons = () => {
    return (
      <div>
        {currentFilter !== "waiting" && (
          <button
            className="btn btn-info ml-1"
            onClick={() => setCurrentFilter("waiting")}
          >
            Đơn chờ phỏng vấn
          </button>
        )}
        {currentFilter !== "accepted" && (
          <button
            className="btn btn-success ml-1"
            onClick={() => setCurrentFilter("accepted")}
          >
            Đơn chấp nhận
          </button>
        )}
        {currentFilter !== "rejected" && (
          <button
            className="btn btn-danger ml-1"
            onClick={() => setCurrentFilter("rejected")}
          >
            Đơn từ chối
          </button>
        )}
      </div>
    );
  };

  // Vô hiệu hóa các hành động khi không ở trạng thái "waiting"
  const disableActions = currentFilter !== "waiting";
  const disableActionsApproved = currentFilter !== "accepted";

  const handleDeleteRegistrations = async () => {
    const confirm = await sweetAlert.confirm(
      `Bạn có chắc muốn xóa ${selectedRegistrations.length} đơn`,
      "",
      "Xác nhận",
      "Hủy bỏ",
      "question"
    );
    if (!confirm) {
      return;
    }
    try {
      enableLoading();
      const deletePromises = selectedRegistrations.map(async (id) => {
        await registrationApi.deleteRegistration(id.toString());
      });

      await Promise.all(deletePromises);
      sweetAlert.alertSuccess("Xóa đơn ứng tuyển thành công!", "", 1000, 28);

      fetchApprovedRegistrations(true);
      setSelectedRegistrations([]);
    } catch (error: any) {
      console.error("Lỗi khi xóa đơn ứng tuyển:", error);
      sweetAlert.alertFailed("Lỗi khi xóa đơn ứng tuyển", ``, 10000, 24);
    } finally {
      disableLoading();
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
      }}
    >
      <h1
        className={`text-center text-[2rem] py-2 font-bold 
        ${!deleteMode && currentFilter == "waiting" ? "bg-info text-text_primary_dark" : ""} 
        ${!deleteMode && currentFilter == "accepted" ? "bg-success text-text_primary_light" : ""} 
        ${!deleteMode && currentFilter == "rejected" ? "bg-danger text-text_primary_light" : ""}
        ${deleteMode ? "bg-black text-text_primary_light" : ""}`}
      >
        {!deleteMode && currentFilter == "waiting"
          ? "Danh sách ứng viên chờ phỏng vấn"
          : ""}
        {!deleteMode && currentFilter == "accepted"
          ? "Danh sách ứng viên đậu phỏng vấn"
          : ""}
        {!deleteMode && currentFilter == "rejected"
          ? "Danh sách ứng viên bị từ chối"
          : ""}
        {deleteMode ? "Lọc các đơn cũ" : ""}
      </h1>

      <div className="flex justify-between items-center w-full my-3">
        {/* Chọn ngày filter */}
        <div className="flex justify-start px-3 min-w-[10px]">
          {!deleteMode ? (
            <>
              <input
                type="date"
                className="w-[200px] py-2 px-2 border rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {renderFilterButtons()}
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="flex">
          {selectedRegistrations.length > 0 && !disableActions && (
            <div className="flex justify-end">
              {selectedRegistrations.length === 1 ? (
                <>
                  <button
                    className="btn btn-success ml-1"
                    onClick={() =>
                      handleOpenApprovalModal(
                        selectedRegistrations[0].toString()
                      )
                    }
                  >
                    Phê duyệt phỏng vấn
                  </button>
                  <button
                    className="btn btn-warning ml-1"
                    onClick={() =>
                      handleOpenUpdateModal(selectedRegistrations[0].toString())
                    }
                  >
                    Cập nhật lịch phỏng vấn
                  </button>
                </>
              ) : (
                <></>
              )}
              {/* <button
                onClick={handleOpenDeleteModal}
                className="btn btn-danger ml-1"
              >
                Xóa lịch phỏng vấn
              </button> */}
            </div>
          )}
          {selectedRegistrations.length > 0 && !disableActionsApproved && (
            <div className="flex justify-end">
              {selectedRegistrations.length === 1 ? (
                <>
                  <button
                    className="btn btn-success ml-1"
                    onClick={() => setOpenDialog(true)}
                  >
                    Tạo tài khoản
                  </button>
                </>
              ) : (
                <></>
              )}
              {/* <button
                onClick={handleOpenDeleteModal}
                className="btn btn-danger ml-1"
              >
                Xóa lịch phỏng vấn
              </button> */}
            </div>
          )}
          {selectedRegistrations.length == 1 ? (
            <>
              <button
                className="btn btn-info ml-1"
                onClick={() => setOpenDialogRegisDetail(true)}
              >
                Xem chi tiết
              </button>
            </>
          ) : (
            <></>
          )}

          {currentFilter == "rejected" &&
          deleteMode &&
          selectedRegistrations.length > 0 ? (
            <>
              <Button
                className="btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
                onClick={() => {
                  handleDeleteRegistrations();
                }}
                variant="outlined"
                color="primary"
              >
                Xóa đơn
              </Button>
            </>
          ) : (
            <></>
          )}
          {currentFilter === "rejected" && !deleteMode ? (
            <>
              <Button
                className="btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
                onClick={() => {
                  setDeleteMode(true);
                  fetchApprovedRegistrations(true);
                }}
                variant="outlined"
                color="primary"
              >
                Lọc đơn
              </Button>
            </>
          ) : (
            <></>
          )}
          {currentFilter === "rejected" && deleteMode ? (
            <>
              <Button
                className="btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
                onClick={() => {
                  setDeleteMode(false);
                  fetchApprovedRegistrations("false");
                }}
                variant="outlined"
                color="primary"
              >
                Xong
              </Button>
            </>
          ) : (
            <></>
          )}
          <button
            className="btn btn-primary ml-1 mr-2"
            onClick={() => {
              handleRefresh();
            }}
          >
            Tải lại
          </button>
        </div>
      </div>

      <div className="px-2">
        {rows.length <= 0 ? (
          <>
            <h1 className="text-[1.2rem] mb-2">
              <strong>Không có ứng viên nào</strong>
            </h1>
          </>
        ) : (
          <>
            <DataGrid
              rows={rows}
              columns={columns}
              paginationMode="client"
              rowCount={rowCount} // Đảm bảo rowCount là tổng số hàng từ server
              loading={loading}
              initialState={{ pagination: { paginationModel } }}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel} // Cập nhật paginationModel khi thay đổi
              pageSizeOptions={[8, 25, 50]}
              onRowSelectionModelChange={handleSelectionChange}
              rowSelectionModel={selectedRegistrations}
              checkboxSelection
              sx={{
                border: 0,
              }}
              localeText={viVNGridTranslation}
            />
          </>
        )}
      </div>

      {/* Modal phê duyệt phỏng vấn */}
      <Modal open={openApprovalModal} onClose={handleCloseApprovalModal}>
        <div
          style={{
            width: "50%",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
          className="py-5 px-5 mt-4"
        >
          <h1 className="text-center text-[2.2rem] text-primary py-2 pt-0 font-bold uppercase">
            Phê duyệt phỏng vấn
          </h1>

          {selectedRegistrationOfModal ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-2 w-[50%]">
                  <strong>Tên ứng viên:</strong>{" "}
                  {selectedRegistrationOfModal.fullName}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Thời gian phỏng vấn:</strong>{" "}
                  {formatDate.DD_MM_YYYY_Time(
                    selectedRegistrationOfModal.interview.meetingTime
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Giới tính:</strong>{" "}
                  {selectedRegistrationOfModal.gender}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(
                    selectedRegistrationOfModal.dateOfBirth
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedRegistrationOfModal.phone}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Email:</strong> {selectedRegistrationOfModal.email}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistrationOfModal.isTeachingBefore
                    ? "Có"
                    : "Không"}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistrationOfModal.yearOfTeaching}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedRegistrationOfModal.address}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Người phỏng vấn:</strong>{" "}
                  {selectedRegistrationOfModal.interview.recruiters
                    ? selectedRegistrationOfModal.interview.recruiters
                        .map((recruiter: any) => recruiter.fullName)
                        .join(", ")
                    : ""}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          <h2 className="my-0 py-0 mt-3">
            <strong>Nhận xét ứng viên</strong>
          </h2>

          <div className="w-full">
            <CkEditor
              data={interviewNote}
              onChange={(data) => setInterviewNote(data)}
              placeholder="Nhập nhận xét ứng viên tại đây..."
            />
          </div>

          {/* <TextField
            label="Ghi chú"
            fullWidth
            multiline
            rows={3}
            value={interviewNote}
            onChange={(e) => setInterviewNote(e.target.value)}
            placeholder="Nhập ghi chú phỏng vấn (không bắt buộc)"
            margin="normal"
            className="my-0 mt-1"
          /> */}

          <FormControl fullWidth margin="normal" className="my-0 mt-3">
            <label id="result-label">
              <strong>Kết quả phỏng vấn</strong>
            </label>
            <MuiSelect
              labelId="result-label"
              value={interviewResult}
              onChange={(e) => setInterviewResult(e.target.value)}
              className={`${interviewResult == "Chấp nhận" ? "bg-success text-white" : ""}
              ${interviewResult == "Từ chối" ? "bg-danger text-white" : ""}`}
            >
              <MenuItem
                value="Chấp nhận"
                className="bg-success text-white py-3"
              >
                Chấp nhận
              </MenuItem>
              <MenuItem value="Từ chối" className="bg-danger text-white py-3">
                Từ chối
              </MenuItem>
            </MuiSelect>
          </FormControl>

          <div
            className="modal-buttons"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button onClick={handleCloseApprovalModal} variant="outlined">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmInterview}
              variant="contained"
              color="primary"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal cập nhật phỏng vấn */}
      <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
        <div
          style={{
            width: "50%",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
          className="py-5 px-5 mt-4"
        >
          <h1 className="text-center text-[2.2rem] text-warning py-2 pt-0 font-bold uppercase">
            Cập nhật lịch phỏng vấn
          </h1>

          {selectedRegistrationOfModal ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-2 w-[50%]">
                  <strong>Tên ứng viên:</strong>{" "}
                  {selectedRegistrationOfModal.fullName}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Thời gian phỏng vấn:</strong>{" "}
                  {formatDate.DD_MM_YYYY_Time(
                    selectedRegistrationOfModal.interview.meetingTime
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Giới tính:</strong>{" "}
                  {selectedRegistrationOfModal.gender}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(
                    selectedRegistrationOfModal.dateOfBirth
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedRegistrationOfModal.phone}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Email:</strong> {selectedRegistrationOfModal.email}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistrationOfModal.isTeachingBefore
                    ? "Có"
                    : "Không"}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistrationOfModal.yearOfTeaching}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedRegistrationOfModal.address}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Người phỏng vấn:</strong>{" "}
                  {selectedRegistrationOfModal.interview.recruiters
                    ? selectedRegistrationOfModal.interview.recruiters
                        .map((recruiter: any) => recruiter.fullName)
                        .join(", ")
                    : ""}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          {/* Cập nhật người phỏng vấn */}
          <FormControl fullWidth margin="normal">
            <label className="font-bold mt-1">Cập nhật người phỏng vấn</label>
            <Select
              options={recruiters.map((acc: any) => ({
                value: acc.id,
                label: `${acc.fullName} ${acc.role && acc.role.roleName.toUpperCase() == AccountRoleString.ADMIN ? " - Admin" : ""} ${acc.role && acc.role.roleName.toUpperCase() == AccountRoleString.MANAGER ? " - Quản lý" : ""} ${acc.role && acc.role.roleName.toUpperCase() == AccountRoleString.CATECHIST ? " - Giáo lý viên" : ""}`,
              }))}
              isMulti
              value={selectedRecruiters}
              onChange={(newValue: any) =>
                setSelectedRecruiters(
                  newValue as { value: string; label: string }[]
                )
              }
              placeholder="Tìm kiếm và chọn người phỏng vấn..."
              className="mt-1 z-[999]"
            />
          </FormControl>

          {/* Cập nhật thời gian phỏng vấn */}
          <TextField
            label="Cập nhật thời gian phỏng vấn"
            type="datetime-local"
            fullWidth
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <div className="mt-2">
            <h5 className="w-[100%] mb-1">
              <strong>Lý do cập nhật phỏng vấn</strong>
            </h5>
            <textarea
              name="updatedInterviewReason"
              onChange={(e) => {
                setUpdatedInterviewReason(e.target.value);
              }}
              className="block w-full p-2 border border-gray-700 rounded-lg"
            />
          </div>

          <div
            className="modal-buttons"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handleUpdateInterview}
              variant="contained"
              color="warning"
            >
              Cập nhật
            </Button>
            <Button
              onClick={handleCloseUpdateModal}
              variant="outlined"
              color="warning"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal xóa phỏng vấn */}
      {/* <Modal open={openDeleteModal} onClose={handleCloseUpdateModal}>
        <div
          style={{
            width: "50%",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
          className="py-5 px-5 mt-4"
        >
          <h1 className="text-center text-[2.2rem] text-danger py-2 pt-0 font-bold uppercase">
            Xóa lịch phỏng vấn
          </h1>

          {selectedRegistrationOfModal ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-2 w-[50%]">
                  <strong>Tên ứng viên:</strong>{" "}
                  {selectedRegistrationOfModal.fullName}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Thời gian phỏng vấn:</strong>{" "}
                  {formatDate.DD_MM_YYYY_Time(
                    selectedRegistrationOfModal.interview.meetingTime
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Giới tính:</strong>{" "}
                  {selectedRegistrationOfModal.gender}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(
                    selectedRegistrationOfModal.dateOfBirth
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedRegistrationOfModal.phone}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Email:</strong> {selectedRegistrationOfModal.email}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistrationOfModal.isTeachingBefore
                    ? "Có"
                    : "Không"}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistrationOfModal.yearOfTeaching}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedRegistrationOfModal.address}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Người phỏng vấn:</strong>{" "}
                  {selectedRegistrationOfModal.interview.recruiters
                    ? selectedRegistrationOfModal.interview.recruiters
                        .map((recruiter: any) => recruiter.fullName)
                        .join(", ")
                    : ""}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          <div className="mt-3">
            <h5 className="w-[100%] mb-1">
              <strong>Lý do xóa lịch phỏng vấn</strong>
            </h5>
            <textarea
              name="deletedInterviewReason"
              onChange={() => {
                // setDeletedInterviewReason(e.target.value);
              }}
              className="block w-full p-2 border border-gray-700 rounded-lg"
            />
          </div>

          <div
            className="modal-buttons"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handleDeleteInterview}
              variant="contained"
              color="error"
            >
              Xác nhận
            </Button>
            <Button
              onClick={handleCloseDeleteModal}
              variant="outlined"
              color="error"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Modal> */}

      {openDialog ? (
        <>
          <CreateAccountAndCatechistDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            registrationItem={rows.find(
              (row) =>
                row.id ===
                (selectedRegistrations[0]
                  ? selectedRegistrations[0].toString()
                  : "")
            )} // Đưa item được chọn
            refresh={fetchApprovedRegistrations}
          />
        </>
      ) : (
        <></>
      )}
      {openDialogRegisDetail ? (
        <>
          <RegistrationDetailDialog
            open={openDialogRegisDetail}
            onClose={() => setOpenDialogRegisDetail(false)}
            id={selectedRegistrations[0].toString()}
          />
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
}
