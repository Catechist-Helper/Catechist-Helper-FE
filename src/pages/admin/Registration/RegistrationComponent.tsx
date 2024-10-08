import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Select from "react-select";
import { Modal, Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import registrationApi from "../../../api/Registration";
import accountApi from "../../../api/Account";
import interviewApi from "../../../api/Interview";
import interviewProcessApi from "../../../api/InterviewProcess";
import {
  RegistrationItemResponse,
  RegistrationResponse,
} from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import viVNGridTranslation from "../../../locale/MUITable";
import { formatDate } from "../../../utils/formatDate";
import { formatPhone } from "../../../utils/utils";
import sweetAlert from "../../../utils/sweetAlert";
import useAppContext from "../../../hooks/useAppContext";
import dayjs, { Dayjs } from "dayjs";
import { BasicResponse } from "../../../model/Response/BasicResponse";

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
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any[]>([]);
  const [meetingTime, setMeetingTime] = useState<string>("");

  const [viewMode, setViewMode] = useState<"pending" | "rejected">("pending"); // Trạng thái xem hiện tại

  // Hàm fetch các đơn đăng ký
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data } = await registrationApi.getAllRegistrations(1, 100); // Lấy 100 đơn

      // Lọc các đơn theo chế độ xem hiện tại
      const filteredRegistrations = data.data.items.filter(
        (registration: RegistrationItemResponse) => {
          if (viewMode === "pending") {
            return registration.status === RegistrationStatus.Pending;
          } else {
            return (
              registration.status === RegistrationStatus.Rejected_Duyet_Don
            );
          }
        }
      );

      setRows(filteredRegistrations);
      setRowCount(filteredRegistrations.length); // Cập nhật tổng số hàng
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
    setPaginationModel(newPaginationModel); // Cập nhật model phân trang
  };

  // Xử lý khi thay đổi các lựa chọn trong bảng
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedIds(newSelectionModel); // Cập nhật danh sách các ID được chọn
    console.log("Selected IDs:", newSelectionModel);
  };

  // Hàm xóa các đơn đã chọn
  const handleDeleteRegistrations = async () => {
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
  };

  // Hàm xử lý khi nhấn nút "Từ chối đơn"
  const handleRejectApplications = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          registrationApi.updateRegistration(id.toString(), {
            status: RegistrationStatus.Rejected_Duyet_Don,
          })
        )
      );
      sweetAlert.alertSuccess("Từ chối đơn thành công", "", 1000, 21);
      setSelectedIds([]); // Clear lựa chọn sau khi thực hiện
      fetchRegistrations(); // Reload danh sách
    } catch (error) {
      sweetAlert.alertFailed("Có lỗi xảy ra khi từ chối đơn!", "", 1000, 23);
    }
  };

  // Fetch Account data
  const fetchAccounts = async () => {
    try {
      const { data } = await accountApi.getAllAccounts();
      setAccounts(data.data.items);
    } catch (error) {
      console.error("Lỗi khi tải danh sách accounts:", error);
    }
  };

  // Open modal for scheduling interview
  const handleOpenModal = () => {
    fetchAccounts(); // Load accounts before opening modal
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleScheduleInterview = async () => {
    try {
      const registrationId: string = selectedIds[0].toString(); // Only one registration at a time
      const selectedAccountIds = selectedAccounts.map((acc: any) => acc.value);

      await registrationApi.updateRegistration(registrationId, {
        status: RegistrationStatus.Approved_Duyet_Don,
        accounts: selectedAccountIds, // optional accounts
      });

      await interviewApi.createInterview({
        registrationId,
        meetingTime: meetingTime,
      });

      await interviewProcessApi.createInterviewProcess({
        registrationId,
        name: "Vòng duyệt đơn",
      });

      sweetAlert.alertSuccess(
        "Đã xếp lịch phỏng vấn thành công!",
        "",
        1000,
        23
      );
      handleCloseModal();
      fetchRegistrations(); // Refresh registration data after scheduling
      setSelectedIds([]);
    } catch (error) {
      console.error("Lỗi khi xếp lịch phỏng vấn:", error);
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
        Danh sách ứng tuyển giáo lý viên
      </h1>

      <div className="flex mt-2 px-3 w-full justify-between">
        <div className="flex justify-start">
          {viewMode === "pending" ? (
            <button
              className="mx-1 btn btn-danger"
              disabled={hasFunction}
              onClick={() => {
                setViewMode("rejected");
                fetchRegistrations();
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
                fetchRegistrations();
              }}
            >
              Đơn chờ duyệt
            </button>
          )}
        </div>
        <div className="flex justify-end">
          {selectedIds.length > 0 ? (
            <>
              {selectedIds.length <= 1 ? (
                <>
                  <button
                    className="mx-1 btn btn-primary"
                    disabled={hasFunction}
                    onClick={() => {
                      handleOpenModal();
                    }}
                  >
                    Xếp lịch phỏng vấn
                  </button>
                </>
              ) : (
                <></>
              )}
              {viewMode != "rejected" ? (
                <>
                  <button
                    className="mx-1 btn btn-warning"
                    onClick={() => {
                      handleRejectApplications();
                    }}
                    disabled={hasFunction}
                  >
                    Từ chối đơn
                  </button>
                </>
              ) : (
                <></>
              )}
              <button
                className="mx-1 btn btn-danger"
                disabled={hasFunction}
                onClick={() => {
                  handleDeleteRegistrations();
                }}
              >
                Xóa đơn
              </button>
            </>
          ) : (
            <></>
          )}
          <button
            className="mx-1 btn bg-primary_color text-text_primary_light hover:text-text_primary_dark
          hover:bg-gray-400"
            onClick={() => {
              fetchRegistrations();
            }}
            disabled={hasFunction}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="px-2">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={rowCount} // Đảm bảo rowCount là tổng số hàng từ server
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[8, 25, 50]} // Đặt pageSizeOptions đúng
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
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        className="fixed z-[1000] flex justify-center items-center"
      >
        <div
          className="modal-container bg-white py-5 px-5 rounded-lg
        w-[50%]"
        >
          <h1 className="text-center text-[2.2rem] text-primary_color py-2 font-bold">
            Xếp lịch phỏng vấn
          </h1>

          <label className="font-bold mt-3">Chọn người phỏng vấn</label>
          <Select
            options={accounts.map((acc: any) => ({
              value: acc.id,
              label: acc.email,
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

          <label className="font-bold mt-3">Ngày phỏng vấn</label>
          <br />
          <input
            type="datetime-local"
            className="w-full rounded mt-1 py-2 px-2"
            style={{ border: "1px solid #d9d9d9" }}
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />

          <div className="modal-buttons flex justify-center gap-x-3 mt-4">
            <Button onClick={handleScheduleInterview} variant="contained">
              Xác nhận
            </Button>
            <Button onClick={handleCloseModal} variant="outlined">
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Modal>
    </Paper>
  );
}
