import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import catechistApi from "../../../api/Catechist";
import { CatechistItemResponse } from "../../../model/Response/Catechist";
import { formatPhone } from "../../../utils/utils";
import viVNGridTranslation from "../../../locale/MUITable";
import sweetAlert from "../../../utils/sweetAlert";
import { formatDate } from "../../../utils/formatDate";

const columns: GridColDef[] = [
  {
    field: "imageUrl",
    headerName: "Ảnh",
    width: 100,
    renderCell: (params) => (
      <img
        src={params.row.imageUrl || "https://via.placeholder.com/150"}
        alt="Catechist"
        width="50"
        height="50"
      />
    ),
  },
  { field: "fullName", headerName: "Tên đầy đủ", width: 200 },
  {
    field: "christianName",
    headerName: "Tên thánh",
    width: 150,
    renderCell: (params) => params.row.christianName || "N/A", // Chỉnh sửa hiển thị tên thánh
  },
  { field: "gender", headerName: "Giới tính", width: 100 },
  {
    field: "dateOfBirth",
    headerName: "Ngày sinh",
    width: 120,
    renderCell: (params) => formatDate.DD_MM_YYYY(params.value),
  },
  { field: "qualification", headerName: "Trình độ", width: 120 },
  {
    field: "level",
    headerName: "Cấp bậc",
    width: 120,
    renderCell: (params) => (params.row.level ? params.row.level.name : "N/A"),
  },
  {
    field: "email",
    headerName: "Email",
    width: 200,
    renderCell: (params) => params.row.email || "N/A", // Hiển thị email nếu có
  },
  {
    field: "phone",
    headerName: "Số điện thoại",
    width: 150,
    renderCell: (params) => formatPhone(params.value),
  },
  { field: "address", headerName: "Địa chỉ", width: 200 },
  { field: "fatherName", headerName: "Tên cha", width: 150 },
  { field: "motherName", headerName: "Tên mẹ", width: 150 },
  { field: "note", headerName: "Ghi chú", width: 200 },
  {
    field: "certificates",
    headerName: "Chứng chỉ",
    width: 250,
    renderCell: (params) =>
      params.row.certificates.length > 0
        ? params.row.certificates.map((cert: any) => cert.name).join(", ")
        : "N/A", // Hiển thị danh sách chứng chỉ
  },
  {
    field: "isTeaching",
    headerName: "Đang giảng dạy",
    width: 150,
    renderCell: (params) =>
      params.value ? (
        <>
          <span className="bg-success text-white px-2 py-1 rounded-md">Có</span>
        </>
      ) : (
        <>
          <span className="bg-danger text-white px-2 py-1 rounded-md">
            Không
          </span>
        </>
      ),
  },
];

export default function CatechistComponent() {
  const [rows, setRows] = useState<CatechistItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 8, // Default page size
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedIds] = useState<GridRowSelectionModel>([]);

  // Hàm fetch các catechist
  const fetchCatechists = async () => {
    try {
      setLoading(true);
      const page = paginationModel.page + 1; // Lấy số trang (MUI DataGrid sử dụng zero-based index)
      const size = paginationModel.pageSize; // Lấy kích thước trang từ paginationModel

      // Gọi API getAllCatechists với các tham số cần thiết
      const { data } = await catechistApi.getAllCatechists(page, size);

      // Cập nhật state với dữ liệu mới
      setRows(data.data.items);
      setRowCount(data.data.total); // Cập nhật tổng số hàng từ phản hồi API
    } catch (error) {
      console.error("Lỗi khi tải danh sách catechists:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi tải danh sách!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatechists();
  }, [paginationModel]); // Cập nhật lại khi paginationModel thay đổi

  // Xử lý sự kiện khi thay đổi trang hoặc kích thước trang
  const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel); // Cập nhật model phân trang
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Danh sách giáo lý viên
      </h1>
      {/* Thêm nút Refresh ở đây */}
      <div className="my-2 flex justify-between mx-3">
        <div className="min-w-[10px]"></div>
        <div className="">
          <Button
            onClick={() => fetchCatechists()} // Gọi lại hàm fetchCatechists
            variant="contained"
            color="primary"
            style={{ marginBottom: "16px" }}
          >
            Tải lại
          </Button>
        </div>
      </div>
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
        sx={{
          border: 0,
        }}
        localeText={viVNGridTranslation}
      />
    </Paper>
  );
}
