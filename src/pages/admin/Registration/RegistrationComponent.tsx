import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import registrationApi from "../../../api/Registration";
import {
  RegistrationItemResponse,
  RegistrationResponse,
} from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import viVNGridTranslation from "../../../locale/MUITable";
import { formatDate } from "../../../utils/formatDate";
import { formatPhone } from "../../../utils/utils";

const columns: GridColDef[] = [
  //   { field: "id", headerName: "ID", width: 70 },
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
        case RegistrationStatus.Approved:
          return "Đã phê duyệt";
        case RegistrationStatus.Rejected:
          return "Bị từ chối";
        default:
          return "Không xác định";
      }
    },
  },
];

export default function RegistrationDataTable() {
  const [rows, setRows] = useState<RegistrationItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 10, // Default page size
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]); // Cập nhật kiểu dữ liệu

  // Gọi API lấy danh sách registrations
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data } = await registrationApi.getAllRegistrations(
        paginationModel.page + 1, // API sử dụng 1-based index cho trang
        paginationModel.pageSize
      );
      setRows(data.data.items);
      setRowCount(data.data.total); // Cập nhật tổng số hàng từ server
    } catch (error) {
      console.error("Lỗi khi tải danh sách registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [paginationModel]);

  // Xử lý sự kiện khi thay đổi trang hoặc kích thước trang
  const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel); // Cập nhật model phân trang
  };

  // Xử lý khi thay đổi các lựa chọn trong bảng
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedIds(newSelectionModel); // Cập nhật danh sách các ID được chọn
    console.log("Selected IDs:", newSelectionModel);
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.35rem)",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Danh sách ứng tuyển giáo lý viên
      </h1>
      <div className="px-2">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={rowCount} // Đảm bảo rowCount là tổng số hàng từ server
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]} // Đặt pageSizeOptions đúng
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange} // Gọi hàm khi thay đổi lựa chọn
          sx={{
            border: 0,
          }}
          localeText={viVNGridTranslation}
        />
      </div>
    </Paper>
  );
}
