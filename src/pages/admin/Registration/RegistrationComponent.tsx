import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Select from "react-select";
import {
  Modal,
  Button,
  Dialog,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import registrationApi from "../../../api/Registration";
import accountApi from "../../../api/Account";
import interviewApi from "../../../api/Interview";
import interviewProcessApi from "../../../api/InterviewProcess";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import { RecruitersByMeetingTimeItemResponse } from "../../../model/Response/Account";
import { RegistrationStatus } from "../../../enums/Registration";
import viVNGridTranslation from "../../../locale/MUITable";
import { formatDate } from "../../../utils/formatDate";
import { formatPhone } from "../../../utils/utils";
import sweetAlert from "../../../utils/sweetAlert";
import useAppContext from "../../../hooks/useAppContext";
import { AccountRoleString } from "../../../enums/Account";
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";
import { RoleNameEnum } from "../../../enums/RoleEnum";
import RegistrationDetailDialog from "../ApprovedRegistration/RegistrationDetailDialog";

const columns: GridColDef[] = [
  { field: "fullName", headerName: "Tên đầy đủ", width: 230 },
  { field: "gender", headerName: "Giới tính", width: 100 },
  {
    field: "dateOfBirth",
    headerName: "Ngày sinh",
    width: 110,
    renderCell: (params) => {
      return formatDate.DD_MM_YYYY(params.value);
    },
  },
  { field: "email", headerName: "Email", width: 200 },
  {
    field: "phone",
    headerName: "Số điện thoại",
    width: 120,
    renderCell: (params) => {
      return formatPhone(params.value);
    },
  },
  { field: "address", headerName: "Địa chỉ", width: 200 },
  {
    field: "isTeachingBefore",
    headerName: "Đã từng dạy",
    width: 120,
    renderCell: (params) => (params.value ? "Có" : "Không"),
  },
  { field: "yearOfTeaching", headerName: "Số năm giảng dạy", width: 150 },
  {
    field: "createdAt",
    headerName: "Thời gian nộp đơn",
    width: 150,
    renderCell: (params) => {
      return formatDate.DD_MM_YYYY_Time(params.value);
    },
  },
  { field: "note", headerName: "Ghi chú", width: 200 },
  {
    field: "status",
    headerName: "Trạng thái",
    width: 150,
    renderCell: (params) => {
      const status = params.value as RegistrationStatus;
      switch (status) {
        case RegistrationStatus.Pending:
          return (
            <span className="inline px-2 py-1 bg-yellow-400 rounded-lg">
              Chờ duyệt
            </span>
          );
        case RegistrationStatus.Approved_Duyet_Don:
          return "Đã phê duyệt";
        case RegistrationStatus.Rejected_Duyet_Don:
          return (
            <span className="inline px-2 py-1 bg-danger rounded-lg text-text_primary_light">
              Bị từ chối
            </span>
          );
        default:
          return "Không xác định";
      }
    },
  },
];

export default function RegistrationDataTable() {
  const [rows, setRows] = useState<RegistrationItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { enableLoading, disableLoading } = useAppContext();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 8, // Default page size
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]); // Cập nhật kiểu dữ liệu
  const [hasFunction, setHasFunction] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [isModalOpenRejected, setIsModalOpenRejected] =
    useState<boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any[]>([]);
  const [previewAccounts, setPreviewAccounts] = useState<
    RecruitersByMeetingTimeItemResponse[]
  >([]);
  const [meetingTime, setMeetingTime] = useState<string>("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationItemResponse | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string>("");
  const [openDialogRegisDetail, setOpenDialogRegisDetail] =
    useState<boolean>(false);

  const [viewMode, setViewMode] = useState<"pending" | "rejected">("pending"); // Trạng thái xem hiện tại

  // Hàm fetch các đơn đăng ký
  const fetchRegistrations = async (deleteModeOn?: boolean | string) => {
    try {
      setLoading(true);

      // Ví dụ: Xác định giá trị cho các tham số, bạn có thể điều chỉnh các giá trị này từ state hoặc form
      const startDate = undefined; // Nếu cần có thể thay đổi, ví dụ "2024-01-01"
      const endDate = undefined; // Nếu cần có thể thay đổi, ví dụ "2024-12-31"
      const status =
        viewMode === "pending"
          ? RegistrationStatus.Pending
          : RegistrationStatus.Rejected_Duyet_Don;

      // const page = paginationModel.page + 1; // Lấy số trang (MUI DataGrid sử dụng zero-based index)
      // const size = paginationModel.pageSize; // Lấy kích thước trang từ paginationModel

      const firstResponse = await registrationApi.getAllRegistrations(
        startDate,
        endDate,
        status,
        1,
        10000
      );

      // Gọi API getAllRegistrations với các tham số cần thiết
      const { data } = await registrationApi.getAllRegistrations(
        startDate,
        endDate,
        status,
        1,
        firstResponse.data.data.total
      );

      // Lọc các đơn theo chế độ xem hiện tại
      const filteredRegistrations =
        (deleteModeOn === true || deleteMode) && deleteModeOn != "false"
          ? data.data.items.filter(
              (item) =>
                Number(formatDate.YYYY(item.createdAt)) <
                Number(
                  formatDate.YYYY(formatDate.getISODateInVietnamTimeZone())
                )
            )
          : data.data.items;

      // Cập nhật state với dữ liệu mới
      setRows(filteredRegistrations);
      setRowCount(filteredRegistrations.length); // Cập nhật tổng số hàng từ phản hồi API
    } catch (error) {
      console.error("Lỗi khi tải danh sách registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [paginationModel, viewMode]); // Cập nhật lại khi paginationModel hoặc viewMode thay đổi

  // Xử lý sự kiện khi thay đổi trang hoặc kích thước trang
  const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  // Xử lý khi thay đổi các lựa chọn trong bảng
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedIds(newSelectionModel); // Cập nhật danh sách các ID được chọn
  };

  // Hàm xóa các đơn đã chọn
  /* const handleDeleteRegistrations = async () => {
    try {
      enableLoading();
      setHasFunction(true); // Bắt đầu quá trình xóa
      const deletePromises = selectedIds.map((id) =>
        registrationApi.deleteRegistration(id as string)
      );
      await Promise.all(deletePromises); // Thực hiện xóa song song
      sweetAlert.alertSuccess("Xoá đơn thành công", "", 1000, 20);
      setSelectedIds([]); // Xóa trạng thái chọn
      fetchRegistrations(); // Load lại danh sách sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa đơn:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi xóa đơn!", "", 1000, 22);
    } finally {
      setHasFunction(false); // Kết thúc quá trình xóa
      disableLoading();
    }
  }; */

  // Hàm xử lý khi nhấn nút "Từ chối đơn"
  const handleRejectApplications = async () => {
    if (!rejectedReason || rejectedReason.trim() == "") {
      sweetAlert.alertFailed(
        "Lý do từ chối đang bị trống",
        "Vui lòng nhập lý do để tiếp tục",
        10000,
        27
      );
      return;
    }

    try {
      enableLoading();
      setHasFunction(true);
      await Promise.all(
        selectedIds.map(async (id) => {
          await registrationApi.updateRegistration(id.toString(), {
            status: RegistrationStatus.Rejected_Duyet_Don,
            note: `Lý do từ chối: ${rejectedReason}`,
            reason: rejectedReason,
          });

          let process = await interviewProcessApi.createInterviewProcess({
            registrationId: id.toString(),
            name: `${RegistrationProcessTitle.DUYET_DON}`,
          });

          await interviewProcessApi.updateInterviewProcess(
            process.data.data.id,
            {
              name: `${RegistrationProcessTitle.DUYET_DON}`,
              status: RegistrationProcessStatus.Rejected,
            }
          );
        })
      );
      sweetAlert.alertSuccess("Từ chối đơn thành công", "", 1000, 21);
      setSelectedIds([]); // Clear lựa chọn sau khi thực hiện
      fetchRegistrations(); // Reload danh sách
      setRejectedReason("");
      handleCloseModalRejected();
      setHasFunction(false);
    } catch (error) {
      sweetAlert.alertFailed("Có lỗi xảy ra khi từ chối đơn!", "", 1000, 23);
    } finally {
      disableLoading();
      fetchRegistrations();
    }
  };

  // Fetch Account data
  const fetchAccounts = async () => {
    try {
      const { data } = await accountApi.getAllAccounts(1, 10000);
      setAccounts(
        data.data.items.filter(
          (item: any) =>
            !item.isDeleted && item.role.roleName == RoleNameEnum.Catechist
        )
      );
    } catch (error) {
      console.error("Lỗi khi tải danh sách accounts:", error);
    }
  };

  const fetchSelectedRegistrationOfModal = async () => {
    await registrationApi
      .getRegistrationById(selectedIds[0].toString())
      .then((res) => {
        setSelectedRegistration(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Open modal for scheduling interview
  const handleOpenModal = () => {
    fetchAccounts(); // Load accounts before opening modal
    fetchSelectedRegistrationOfModal();
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedRegistration(null);
    }
  }, [isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMeetingTime("");
  };

  const handleOpenModalRejected = () => {
    fetchSelectedRegistrationOfModal();
    setIsModalOpenRejected(true);
  };

  const handleCloseModalRejected = () => {
    setIsModalOpenRejected(false);
  };

  const [interviewTypeOption, setInterviewTypeOption] = useState<number>(-1);
  const handleScheduleInterview = async () => {
    try {
      enableLoading();
      const registrationId: string = selectedIds[0].toString();
      const selectedAccountIds = selectedAccounts.map((acc: any) => acc.value);

      if (meetingTime == "") {
        sweetAlert.alertFailed(
          "Vui lòng chọn thời gian phỏng vấn",
          "",
          6000,
          27
        );
        return;
      }

      if (interviewTypeOption < 0) {
        sweetAlert.alertFailed(
          "Vui lòng chọn hình thức phỏng vấn",
          "",
          6000,
          27
        );
        return;
      }

      if (selectedAccountIds.length <= 0) {
        sweetAlert.alertFailed("Vui lòng chọn người phỏng vấn", "", 6000, 26);
        return;
      }

      if (viewMode === "pending") {
        await registrationApi.updateRegistration(registrationId, {
          status: RegistrationStatus.Approved_Duyet_Don,
        });
      } else {
        const regisChoose = rows.find(
          (item) => item.id == selectedIds[0].toString()
        );
        if (regisChoose && regisChoose.note) {
          await registrationApi.updateRegistration(registrationId, {
            status: RegistrationStatus.Approved_Duyet_Don,
            note: regisChoose.note.replace(
              "Lý do từ chối",
              "Lý do từ chối vòng duyệt đơn lần 1"
            ),
          });
        } else {
          await registrationApi.updateRegistration(registrationId, {
            status: RegistrationStatus.Approved_Duyet_Don,
          });
        }
      }

      await interviewApi.createInterview({
        registrationId,
        meetingTime: meetingTime,
        interviewType: interviewTypeOption,
        accounts: selectedAccountIds,
      });

      let process = await interviewProcessApi.createInterviewProcess({
        registrationId: registrationId,
        name:
          viewMode === "pending"
            ? `${RegistrationProcessTitle.DUYET_DON}`
            : `${RegistrationProcessTitle.DUYET_DON_LAI}`,
      });

      await interviewProcessApi.updateInterviewProcess(process.data.data.id, {
        name:
          viewMode === "pending"
            ? `${RegistrationProcessTitle.DUYET_DON}`
            : `${RegistrationProcessTitle.DUYET_DON_LAI}`,
        status: RegistrationProcessStatus.Approved,
      });

      sweetAlert.alertSuccess(
        "Đã xếp lịch phỏng vấn thành công!",
        "",
        1000,
        28
      );
      handleCloseModal();
      fetchRegistrations(); // Refresh registration data after scheduling
      setSelectedIds([]);
      setMeetingTime("");
      setInterviewTypeOption(-1);
    } catch (error: any) {
      console.error("Lỗi khi xếp lịch phỏng vấn:", error);
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

  useEffect(() => {
    if (meetingTime == "") {
      setSelectedAccounts([]);
      setPreviewAccounts([]);
      setInterviewTypeOption(-1);
    } else if (meetingTime && meetingTime != "") {
      const action = async () => {
        const res = await accountApi.getRecruitersByMeetingTime(meetingTime);
        setPreviewAccounts(
          res.data.data.items.sort((a: any, b: any) => {
            if (a.interviews && b.interviews) {
              return a.interviews.length - b.interviews.length;
            }
            return -1;
          })
        );
      };
      action();
    }
  }, [meetingTime]);

  const handleDeleteRegistrations = async () => {
    const confirm = await sweetAlert.confirm(
      `Bạn có chắc muốn xóa ${selectedIds.length} đơn`,
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
      const deletePromises = selectedIds.map(async (id) => {
        await registrationApi.deleteRegistration(id.toString());
      });

      await Promise.all(deletePromises);
      sweetAlert.alertSuccess("Xóa đơn ứng tuyển thành công!", "", 1000, 28);

      fetchRegistrations(true);
      setSelectedIds([]);
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
        className={`text-center text-[2.2rem]  text-text_primary_light py-2 font-bold 
          ${!deleteMode ? `${viewMode === "pending" ? "bg-primary_color" : "bg-danger"}` : "bg-black"}`}
      >
        {!deleteMode ? (
          <>
            {viewMode === "pending"
              ? "Danh sách ứng tuyển giáo lý viên chờ phê duyệt"
              : "Danh sách ứng tuyển giáo lý viên bị từ chối"}
          </>
        ) : (
          <>Lọc các đơn ứng tuyển</>
        )}
      </h1>

      <div className="flex mt-2 px-3 w-full justify-between">
        <div className="flex justify-start">
          {!deleteMode ? (
            <>
              {viewMode === "pending" ? (
                <button
                  className="mx-1 btn btn-danger"
                  disabled={hasFunction}
                  onClick={() => {
                    setViewMode("rejected");
                  }}
                >
                  Đơn bị từ chối
                </button>
              ) : (
                <button
                  className="mx-1 btn btn-warning"
                  disabled={hasFunction}
                  onClick={() => {
                    setViewMode("pending");
                  }}
                >
                  Đơn chờ duyệt
                </button>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="flex justify-end gap-x-2">
          {selectedIds.length > 0 && !deleteMode ? (
            <>
              {selectedIds.length <= 1 ? (
                <>
                  <Button
                    className="btn btn-primary"
                    disabled={hasFunction}
                    onClick={() => {
                      handleOpenModal();
                    }}
                    variant="outlined"
                    color="primary"
                  >
                    {viewMode === "pending"
                      ? "Xếp lịch phỏng vấn"
                      : "Xếp lịch phỏng vấn lại"}
                  </Button>

                  {viewMode != "rejected" ? (
                    <>
                      <Button
                        className="btn btn-danger"
                        onClick={() => {
                          handleOpenModalRejected();
                        }}
                        disabled={hasFunction}
                        variant="outlined"
                        color="primary"
                      >
                        Từ chối đơn
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
              {/* <Button
                className="mx-1 btn btn-danger"
                disabled={hasFunction}
                onClick={() => {
                  handleDeleteRegistrations();
                }}
              >
                Xóa đơn
              </Button> */}
            </>
          ) : (
            <></>
          )}

          {selectedIds.length == 1 ? (
            <>
              <Button
                className="btn btn-info"
                onClick={() => setOpenDialogRegisDetail(true)}
                variant="outlined"
                color="primary"
              >
                Xem chi tiết
              </Button>
            </>
          ) : (
            <></>
          )}
          {viewMode == "rejected" && deleteMode && selectedIds.length > 0 ? (
            <>
              <Button
                className="btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
                onClick={() => {
                  handleDeleteRegistrations();
                }}
                disabled={hasFunction}
                variant="outlined"
                color="primary"
              >
                Xóa đơn
              </Button>
            </>
          ) : (
            <></>
          )}
          {viewMode == "rejected" && !deleteMode ? (
            <>
              <Button
                className="btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
                onClick={() => {
                  setDeleteMode(true);
                  fetchRegistrations(true);
                }}
                disabled={hasFunction}
                variant="outlined"
                color="primary"
              >
                Lọc đơn
              </Button>
            </>
          ) : (
            <></>
          )}
          {deleteMode ? (
            <>
              <Button
                className="btn btn-primary"
                disabled={hasFunction}
                onClick={() => {
                  setDeleteMode(false);
                  fetchRegistrations("false");
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
          <Button
            className="btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
            onClick={() => {
              fetchRegistrations();
            }}
            disabled={hasFunction}
            variant="outlined"
            color="primary"
          >
            Tải lại
          </Button>
        </div>
      </div>

      <div className="px-2">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="client"
          rowCount={rowCount} // Đảm bảo rowCount là tổng số hàng từ server
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[3, 25, 50]} // Đặt pageSizeOptions đúng
          checkboxSelection
          rowSelectionModel={selectedIds}
          onRowSelectionModelChange={handleSelectionChange} // Gọi hàm khi thay đổi lựa chọn
          sx={{
            border: 0,
          }}
          localeText={viVNGridTranslation}
        />
      </div>

      {/* Dialog để xếp lịch phỏng vấn */}
      <Dialog
        open={isModalOpen}
        className="z-[1000] flex justify-center items-center"
        fullWidth
        maxWidth="md"
      >
        <div
          className="modal-container bg-white py-5 px-5 rounded-lg
        w-full"
          style={{ scrollBehavior: "smooth", overflowY: "scroll" }}
        >
          <h1 className="text-center text-[2.2rem] text-primary py-2 pt-0 font-bold uppercase">
            Xếp lịch phỏng vấn
          </h1>

          {selectedRegistration ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-3 w-[100%]">
                  <strong>Tên ứng viên:</strong> {selectedRegistration.fullName}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Giới tính:</strong> {selectedRegistration.gender}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(selectedRegistration.dateOfBirth)}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Số điện thoại:</strong> {selectedRegistration.phone}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Email:</strong> {selectedRegistration.email}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistration.isTeachingBefore ? "Có" : "Không"}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistration.yearOfTeaching}
                </h5>
                <h5 className="mt-3 w-[100%]">
                  <strong>Địa chỉ:</strong> {selectedRegistration.address}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          <label className="font-bold mt-4">Ngày phỏng vấn</label>
          <br />
          <input
            type="datetime-local"
            className="w-full rounded mt-1 py-2 px-2"
            style={{ border: "1px solid #d9d9d9" }}
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />

          {meetingTime != "" ? (
            <>
              <label className="font-bold mt-4">Chọn hình thức phỏng vấn</label>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                value={interviewTypeOption}
                onChange={(event) => {
                  setInterviewTypeOption(Number(event.target.value));
                }}
              >
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Offline"
                />
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Online"
                />
              </RadioGroup>
              <label className="font-bold mt-4">Chọn người phỏng vấn</label>
              <Select
                options={accounts.map((acc: any) => ({
                  value: acc.id,
                  label: `${acc.fullName} ${acc.role && acc.role.roleName.toUpperCase() == AccountRoleString.ADMIN ? " - Admin" : ""} ${acc.role && acc.role.roleName.toUpperCase() == AccountRoleString.MANAGER ? " - Quản lý" : ""} ${acc.role && acc.role.roleName.toUpperCase() == AccountRoleString.CATECHIST ? " - Giáo lý viên" : ""}`,
                }))}
                isMulti
                onChange={(newValue) =>
                  setSelectedAccounts(
                    newValue as { value: string; label: string }[]
                  )
                }
                placeholder="Tìm kiếm và chọn người phỏng vấn..."
                className="mt-1"
              />
              <label className="font-bold mt-4">
                Danh sách lịch phân công phỏng vấn ngày{" "}
                {formatDate.DD_MM_YYYY(meetingTime)}
              </label>
              <DataGrid
                rows={previewAccounts}
                columns={[
                  {
                    field: "avatar",
                    headerName: "Ảnh",
                    width: 100,
                    renderCell: (params) => (
                      <img
                        src={
                          params.row.avatar || "https://via.placeholder.com/50"
                        }
                        alt="Avatar"
                        width={50}
                        height={50}
                        style={{ borderRadius: "3px" }}
                      />
                    ),
                  },
                  { field: "fullName", headerName: "Họ và Tên", width: 200 },
                  { field: "gender", headerName: "Giới tính", width: 150 },
                  {
                    field: "interviewCount",
                    headerName: "Số lượng phỏng vấn",
                    width: 150,
                    renderCell: (params) => (
                      <>
                        {params.row.interviews ? (
                          <>
                            {params.row.interviews.length}
                            {params.row.interviews.length > 0 ? (
                              <>{` (${params.row.interviews
                                .map((item: any) =>
                                  formatDate.HH_mm(item.meetingTime)
                                )
                                .join(", ")})`}</>
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <>0</>
                        )}
                      </>
                    ),
                  },
                ]}
                paginationMode="client"
                rowCount={previewAccounts.length}
                loading={loading}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[8, 25, 50]}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                }}
                localeText={viVNGridTranslation}
              />
            </>
          ) : (
            <></>
          )}

          <div className="modal-buttons flex justify-center gap-x-3 mt-4">
            <Button
              onClick={() => {
                handleScheduleInterview();
              }}
              variant="contained"
            >
              Xác nhận
            </Button>
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Dialog>

      <Modal
        open={isModalOpenRejected}
        className="fixed z-[1000] flex justify-center items-center"
      >
        <div
          className="modal-container bg-white py-5 px-5 rounded-lg
        w-[50%]"
        >
          <h1 className="text-center text-[2.2rem] text-danger py-2 pt-0 font-bold uppercase">
            Từ chối đơn
          </h1>
          {selectedRegistration ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-3 w-[100%]">
                  <strong>Tên ứng viên:</strong> {selectedRegistration.fullName}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Giới tính:</strong> {selectedRegistration.gender}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(selectedRegistration.dateOfBirth)}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Số điện thoại:</strong> {selectedRegistration.phone}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Email:</strong> {selectedRegistration.email}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistration.isTeachingBefore ? "Có" : "Không"}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistration.yearOfTeaching}
                </h5>
                <h5 className="mt-3 w-[100%]">
                  <strong>Địa chỉ:</strong> {selectedRegistration.address}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="mt-3">
            <h5 className="w-[100%] mb-1">
              <strong>Lý do từ chối:</strong>
            </h5>
            <textarea
              name="rejectedNote"
              onChange={(e) => {
                setRejectedReason(e.target.value);
              }}
              className="block w-full p-2 border border-gray-700 rounded-lg"
            />
          </div>
          <div className="modal-buttons flex justify-center gap-x-3 mt-4">
            <Button
              onClick={() => {
                handleRejectApplications();
              }}
              variant="contained"
              className="bg-danger"
            >
              Xác nhận
            </Button>
            <Button
              onClick={() => {
                handleCloseModalRejected();
              }}
              variant="outlined"
              className="border-danger text-danger"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Modal>
      {openDialogRegisDetail ? (
        <>
          <RegistrationDetailDialog
            open={openDialogRegisDetail}
            onClose={() => setOpenDialogRegisDetail(false)}
            id={selectedIds[0].toString()}
          />
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
}
