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
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";
import { RoleNameEnum } from "../../../enums/RoleEnum";
import RegistrationDetailDialog from "../ApprovedRegistration/RegistrationDetailDialog";
import catechistApi from "../../../api/Catechist";

export default function RegistrationDataTable() {
  const [rows, setRows] = useState<RegistrationItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { enableLoading, disableLoading } = useAppContext();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 10, // Default page size
  });
  const [paginationModel2, setPaginationModel2] = useState<GridPaginationModel>(
    {
      page: 0,
      pageSize: 8,
    }
  );
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
          ? data.data.items
          : // .filter(
            //     (item) =>
            //       Number(formatDate.YYYY(item.createdAt)) <
            //       Number(
            //         formatDate.YYYY(formatDate.getISODateInVietnamTimeZone())
            //       )
            //   )
            data.data.items;

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

  // Hàm xử lý khi nhấn nút "Từ chối đơn"
  const handleRejectApplications = async () => {
    if (!rejectedReason || rejectedReason.trim() == "") {
      sweetAlert.alertWarning(
        "Lý do từ chối đang bị trống",
        "Vui lòng nhập lý do để tiếp tục",
        3000,
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
      sweetAlert.alertSuccess("Từ chối đơn thành công", "", 2000, 23);
      setSelectedIds([]); // Clear lựa chọn sau khi thực hiện
      fetchRegistrations(); // Reload danh sách
      setRejectedReason("");
      handleCloseModalRejected();
      setHasFunction(false);
    } catch (error) {
      console.error("Có lỗi xảy ra khi từ chối đơn!", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi từ chối đơn!", "", 2500, 25);
    } finally {
      disableLoading();
      fetchRegistrations();
    }
  };

  // Fetch Account data
  const fetchAccounts = async () => {
    try {
      setAccounts([]);
      const firstRes = await accountApi.getAllAccounts(1, 10000);

      const { data } = await accountApi.getAllAccounts(
        1,
        firstRes.data.data.total
      );

      const firstCateRes = await catechistApi.getAllCatechists();
      const cateRes = await catechistApi.getAllCatechists(
        1,
        firstCateRes.data.data.total
      );
      data.data.items
        .filter(
          (item: any) =>
            !item.isDeleted && item.role.roleName == RoleNameEnum.Catechist
        )
        .forEach((item) => {
          const action = async () => {
            const cate = cateRes.data.data.items.find(
              (cate) => cate.account.id == item.id
            );
            if (cate) {
              setAccounts((prev) => [...prev, { ...item, cate: cate }]);
            }
          };
          action();
        });
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
        console.error(err);
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
      if (meetingTime == "") {
        sweetAlert.alertWarning(
          "Vui lòng chọn thời gian phỏng vấn",
          "",
          4000,
          27
        );
        return;
      }

      if (interviewTypeOption < 0) {
        sweetAlert.alertWarning(
          "Vui lòng chọn hình thức phỏng vấn",
          "",
          4000,
          27
        );
        return;
      }

      const selectedAccountIds = selectedAccounts.map((acc: any) => acc.value);

      if (selectedAccountIds.length <= 0) {
        sweetAlert.alertWarning("Vui lòng chọn người phỏng vấn", "", 6000, 26);
        return;
      }

      enableLoading();
      const registrationId: string = selectedIds[0].toString();

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
        2500,
        28
      );

      handleCloseModal();
      fetchRegistrations(); // Refresh registration data after scheduling
      setSelectedIds([]);
      setMeetingTime("");
      setInterviewTypeOption(-1);
    } catch (error: any) {
      console.error("Lỗi khi xếp lịch phỏng vấn:", error);
      if (
        error &&
        error.message &&
        error.message.toString().toLowerCase().includes("scheduled at least")
      ) {
        sweetAlert.alertFailed(
          "Lỗi khi xếp lịch phỏng vấn",
          `Lịch phỏng vấn phải cách ngày hiện tại ít nhất ${error.message.split("scheduled at least ")[1].split(" ")[0].trim()} ngày`,
          10000,
          24
        );
      } else {
        sweetAlert.alertFailed("Có lỗi khi xếp lịch phỏng vấn", ``, 2500, 24);
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
        const firstCateRes = await catechistApi.getAllCatechists();
        const cateRes = await catechistApi.getAllCatechists(
          1,
          firstCateRes.data.data.total
        );

        // setPreviewAccounts(
        res.data.data.items
          .sort((a: any, b: any) => {
            if (a.interviews && b.interviews) {
              return a.interviews.length - b.interviews.length;
            }
            return -1;
          })
          .forEach((item) => {
            const action = async () => {
              const cate = cateRes.data.data.items.find(
                (cate) => cate.account.id == item.id
              );
              if (cate) {
                setPreviewAccounts((prev) => [
                  ...prev,
                  { ...item, cate: cate },
                ]);
              }
            };
            action();
          });
        // );
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
          ${!deleteMode ? `${viewMode === "pending" ? "bg_title" : "bg-danger"}` : "bg-black"}`}
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
                <Button
                  color="error"
                  variant="contained"
                  disabled={hasFunction}
                  onClick={() => {
                    setViewMode("rejected");
                  }}
                >
                  Đơn bị từ chối
                </Button>
              ) : (
                <Button
                  color="secondary"
                  variant="contained"
                  disabled={hasFunction}
                  onClick={() => {
                    setViewMode("pending");
                  }}
                >
                  Đơn chờ duyệt
                </Button>
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
                        color="error"
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
                className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
                onClick={() => setOpenDialogRegisDetail(true)}
                variant="outlined"
                color="secondary"
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
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteRegistrations();
                }}
                disabled={hasFunction}
                variant="outlined"
                color="error"
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
                onClick={() => {
                  setDeleteMode(true);
                  fetchRegistrations(true);
                }}
                disabled={hasFunction}
                variant="outlined"
                color="secondary"
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
            onClick={() => {
              fetchRegistrations();
            }}
            disabled={hasFunction}
            variant="contained"
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
          pageSizeOptions={[10, 25, 50, 100, 250]}
          checkboxSelection
          rowSelectionModel={selectedIds}
          onRowSelectionModelChange={handleSelectionChange} // Gọi hàm khi thay đổi lựa chọn
          sx={{
            border: 0,
          }}
          localeText={viVNGridTranslation}
          disableMultipleRowSelection={!deleteMode}
        />
      </div>

      {/* Dialog để xếp lịch phỏng vấn */}
      <Dialog
        open={isModalOpen}
        className="z-[1000] flex justify-center items-center"
        fullWidth
        maxWidth="lg"
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
                  label: `${acc.fullName} ${acc.cate ? ` - ${acc.cate.code}` : ""}`,
                }))}
                isMulti
                value={selectedAccounts}
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
                rows={
                  previewAccounts
                  //   .sort((a, b) => {
                  //   if (a.cate && b.cate) {
                  //     return b.cate.levelName.localeCompare(a.cate.levelName);
                  //   }
                  //   return -1;
                  // })
                }
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
                  {
                    field: "code",
                    headerName: "Mã giáo lý viên",
                    width: 150,
                    renderCell: (params) =>
                      params.row.cate ? params.row.cate.code : "",
                  },
                  { field: "fullName", headerName: "Họ và Tên", width: 200 },
                  { field: "gender", headerName: "Giới tính", width: 100 },
                  {
                    field: "dateOfBirth",
                    headerName: "Ngày sinh",
                    width: 130,
                    renderCell: (params) =>
                      params.row.cate
                        ? formatDate.DD_MM_YYYY(params.row.cate.dateOfBirth)
                        : "",
                  },
                  {
                    field: "levelName",
                    headerName: "Cấp bậc",
                    width: 100,
                    renderCell: (params) =>
                      params.row.cate ? params.row.cate.levelName : "",
                  },
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

                  {
                    field: "action",
                    headerName: "Hành động",
                    width: 100,
                    renderCell: (params) => {
                      return (
                        <>
                          {selectedAccounts.findIndex(
                            (item) => item.value == params.row.id
                          ) < 0 ? (
                            <Button
                              onClick={() => {
                                const newValue = accounts.find(
                                  (item) => item.id == params.row.id
                                );
                                if (newValue) {
                                  setSelectedAccounts((prev) => [
                                    ...prev,
                                    {
                                      value: newValue.id,
                                      label: `${newValue.fullName} ${newValue.cate ? ` - ${newValue.cate.code}` : ""}`,
                                    },
                                  ]);
                                }
                              }}
                            >
                              Thêm
                            </Button>
                          ) : (
                            <span className="ml-1 text-success"> Đã thêm</span>
                          )}
                        </>
                      );
                    },
                  },
                ]}
                paginationMode="client"
                rowCount={previewAccounts.length}
                loading={loading}
                initialState={{
                  pagination: { paginationModel: paginationModel2 },
                }}
                onPaginationModelChange={setPaginationModel2}
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

          <div className="modal-buttons flex justify-between gap-x-3 mt-4">
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={() => {
                handleScheduleInterview();
              }}
              variant="contained"
            >
              Xác nhận
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
          <div className="modal-buttons flex justify-between gap-x-3 mt-4">
            <Button
              onClick={() => {
                handleCloseModalRejected();
              }}
              variant="outlined"
              className="border-danger text-danger"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={() => {
                handleRejectApplications();
              }}
              variant="contained"
              className="bg-danger"
            >
              Xác nhận
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
