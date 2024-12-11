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
import CatechistDialog from "./CatechistDialog";
import timetableApi from "../../../api/Timetable";
import catechistInClassApi from "../../../api/CatechistInClass";
import FileSaver from "file-saver";
import useAppContext from "../../../hooks/useAppContext";
import CatechistLeaveRequestDialog from "./CatechistLeaveRequestDialog";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { PATH_ADMIN } from "../../../routes/paths";

export default function CatechistComponent() {
  const [rows, setRows] = useState<CatechistItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 50, // Default page size
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedIds] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { enableLoading, disableLoading } = useAppContext();
  const [selectedCatechist, setSelectedCatechist] =
    useState<CatechistItemResponse | null>(null); // Catechist đang chọn
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // Mở dialog
  const [statusIsTeaching, setStatusIsTeaching] = useState<any>({
    value: true,
    label: "Đang hoạt động",
  });
  const [totalCate, setTotalCate] = useState<number>(0);
  const [totalActiveCate, setTotalActiveCate] = useState<number>(0);
  const navigate = useNavigate();

  const handleOpenDialog = (catechist: CatechistItemResponse) => {
    setSelectedCatechist(catechist); // Lưu id của catechist
    setDialogOpen(true); // Mở dialog
  };

  const handleCloseDialog = () => {
    setDialogOpen(false); // Đóng dialog
    setSelectedCatechist(null); // Reset selectedCatechist
  };
  const columns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={
            params.row.imageUrl && params.row.imageUrl != ""
              ? params.row.imageUrl
              : "https://via.placeholder.com/150"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    { field: "code", headerName: "Mã giáo lý viên", width: 140 },
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
      renderCell: (params) =>
        params.row.level ? params.row.level.name : "N/A",
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
      headerName: "Trạng thái giảng dạy",
      width: 250,
      renderCell: (params) =>
        params.value ? (
          <div className="flex gap-x-1">
            <div>
              <span className="bg-success text-white px-2 py-1 rounded-xl">
                Đang hoạt động
              </span>
            </div>
            <div>
              <Button
                color="secondary"
                onClick={() => {
                  handleChangeIsTeaching(params.row);
                }}
              >
                Thay đổi
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-x-1">
              <div>
                <span className="bg-danger text-white px-2 py-1 rounded-xl">
                  Đã nghỉ
                </span>
              </div>
              <div>
                <Button color="secondary" onClick={() => {}}>
                  Xem phê duyệt
                </Button>
              </div>
            </div>
          </>
        ),
    },
  ];
  const handleAddCatechist = () => {
    setOpenDialog(true);
  };

  // Hàm fetch các catechist
  const fetchCatechists = async () => {
    try {
      setLoading(true);

      const firstRes = await catechistApi.getAllCatechists();
      const { data } = await catechistApi.getAllCatechists(
        1,
        firstRes.data.data.total
      );

      setTotalCate(firstRes.data.data.total);
      let finalData = data.data.items.filter(
        (item) => item.isTeaching == statusIsTeaching.value
      );

      if (statusIsTeaching.value) {
        setTotalActiveCate(finalData.length);
      } else {
        setTotalActiveCate(firstRes.data.data.total - finalData.length);
      }

      setRows(finalData);
      setRowCount(finalData.length);
    } catch (error) {
      console.error("Lỗi khi tải danh sách catechists:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi tải danh sách!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCatechists = async () => {
    try {
      enableLoading();
      const { data } = await timetableApi.exportCatechistData();

      // Tạo Blob từ response và sử dụng FileSaver để tải xuống file
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileSaver.saveAs(blob, "Danh_sach_giao_ly_vien.xlsx");
    } catch (error) {
      console.error("Lỗi khi xuất danh sách giáo lý viên:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi xuất danh sách!", "", 1000, 22);
    } finally {
      disableLoading();
    }
  };

  useEffect(() => {
    fetchCatechists();
  }, [statusIsTeaching]);

  const handleChangeIsTeaching = async (catechist: CatechistItemResponse) => {
    try {
      enableLoading();

      const remainingClassHavingSlots =
        await catechistInClassApi.getClassesRemainingSlotsOfCatechist(
          catechist.id
        );
      console.log(
        "remainingClassHavingSlots",
        remainingClassHavingSlots.data.data.length,
        remainingClassHavingSlots.data.data
      );
      if (remainingClassHavingSlots.data.data.length > 0) {
        disableLoading();
        const confirm = await sweetAlert.confirm(
          `Không thể thay đổi trạng thái giảng dạy`,
          `Giáo lý viên ${catechist.fullName} hiện vẫn còn tiết học ở
           lớp học sau:\n
          ${remainingClassHavingSlots.data.data.map((item) => `${item.name} (Niên khóa ${formatDate.YYYY(item.startDate)}-${formatDate.YYYY(item.endDate)})`).join(", ")}`,
          "Xem lớp học",
          "Hủy bỏ"
        );
        if (confirm) {
          let selectClassIds: string[] = [];
          remainingClassHavingSlots.data.data.forEach((item) => {
            selectClassIds.push(item.id);
          });
          navigate(`${PATH_ADMIN.class_management}`, {
            state: {
              classIds: selectClassIds,
            },
          });
        }
        return;
      }
      handleOpenDialog(catechist);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi thay đổi trạng thái!",
        "",
        1000,
        22
      );
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
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Danh sách giáo lý viên
      </h1>
      {/* Thêm nút Refresh ở đây */}
      <div className="my-2 flex justify-between mx-3">
        <div className="min-w-[10px] gap-x-10 flex">
          <div>
            <label htmlFor="" className="ml-2">
              Trạng thái giảng dạy
            </label>
            <Select
              options={[
                { value: true, label: "Đang hoạt động" },
                { value: false, label: "Đã nghỉ" },
              ]}
              value={statusIsTeaching}
              onChange={(newValue: any) =>
                setStatusIsTeaching(
                  newValue as { value: string; label: string }[]
                )
              }
              placeholder="Chọn trạng thái giảng dạy"
              className={`mt-1 z-[999] w-[200px]`}
            />
          </div>
          <div>
            <p>Tổng số lượng giáo lý viên: {totalCate}</p>{" "}
            <p>Tổng số lượng giáo lý viên hoạt động: {totalActiveCate}</p>
            <p>
              Tổng số lượng giáo lý viên đã nghỉ: {totalCate - totalActiveCate}
            </p>
          </div>
        </div>
        <div className="flex gap-x-2">
          <div>
            {" "}
            <Button
              onClick={handleExportCatechists} // Xuất danh sách
              variant="contained"
              color="secondary"
              style={{ marginBottom: "16px" }}
            >
              Xuất danh sách
            </Button>
          </div>
          <div>
            {" "}
            <Button
              onClick={handleAddCatechist} // Open dialog
              variant="contained"
              color="primary"
              style={{ marginBottom: "16px" }}
            >
              Thêm giáo lý viên
            </Button>
          </div>
          <div>
            {" "}
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
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="client"
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        pageSizeOptions={[50, 100, 250]}
        checkboxSelection
        rowSelectionModel={selectedIds}
        sx={{
          border: 0,
        }}
        localeText={viVNGridTranslation}
      />
      {openDialog && (
        <CatechistDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          refresh={fetchCatechists}
        />
      )}
      {selectedCatechist && (
        <CatechistLeaveRequestDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          catechistId={selectedCatechist.id}
          refreshCatechists={fetchCatechists} // Cập nhật lại danh sách catechists sau khi phê duyệt
        />
      )}
    </Paper>
  );
}
