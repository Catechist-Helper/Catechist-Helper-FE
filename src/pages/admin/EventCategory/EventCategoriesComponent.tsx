import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import eventCategoryApi from "../../../api/EventCategory";
import { EventCategoryItemResponse } from "../../../model/Response/EventCategory";
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import EventCategoryDialog from "./EventCategoryDialog";

const columns: GridColDef[] = [
  { field: "name", headerName: "Tên danh mục", width: 250 },
  { field: "description", headerName: "Mô tả", width: 400 },
];

export default function EventCategoriesComponent() {
  const [rows, setRows] = useState<EventCategoryItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false); // Dialog state
  const [editingCategory, setEditingCategory] =
    useState<EventCategoryItemResponse | null>(null); // For editing

  // Hàm fetch dữ liệu tất cả Event Categories
  const fetchEventCategories = async () => {
    try {
      setLoading(true);
      const { data } = await eventCategoryApi.getAllEventCategories(); // Gọi API lấy tất cả dữ liệu
      setRows(data.data.items); // Cập nhật dữ liệu vào state
    } catch (error) {
      console.error("Lỗi khi tải danh sách danh mục:", error);
      sweetAlert.alertFailed("Không thể tải danh sách danh mục!", "", 3000, 26);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventCategories(); // Lấy dữ liệu khi component được mount
  }, []);

  // Mở Dialog để thêm mới danh mục
  const handleAddCategory = () => {
    setEditingCategory(null); // Clear dữ liệu chỉnh sửa
    setOpenDialog(true); // Mở dialog
  };

  // Mở Dialog để chỉnh sửa danh mục
  const handleEditCategory = () => {
    if (selectedIds.length !== 1) {
      sweetAlert.alertWarning(
        "Vui lòng chọn 1 danh mục để chỉnh sửa!",
        "",
        3000,
        30
      );
      return;
    }
    const selectedCategory = rows.find((row) => row.id === selectedIds[0]);
    if (selectedCategory) {
      setEditingCategory(selectedCategory); // Set dữ liệu danh mục để chỉnh sửa
      setOpenDialog(true); // Mở dialog
    }
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = async () => {
    if (selectedIds.length === 0) {
      sweetAlert.alertWarning("Vui lòng chọn danh mục để xóa!", "", 3000, 26);
      return;
    }
    const confirm = await sweetAlert.confirm(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa ${selectedIds.length} danh mục?`,
      "Xóa",
      "Hủy"
    );
    if (!confirm) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          eventCategoryApi.deleteEventCategory(id.toString())
        )
      );
      sweetAlert.alertSuccess("Xóa danh mục thành công!", "", 3000, 25);
      fetchEventCategories(); // Làm mới danh sách sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      sweetAlert.alertFailed("Không thể xóa danh mục!", "", 3000, 25);
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Quản lý danh mục sự kiện
      </h1>
      <div className="my-2 flex justify-between mx-3">
        {/* Nút thêm, sửa, xóa */}
        <div className="space-x-2">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
          >
            Thêm mới
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEditCategory}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCategory}
          >
            Xóa
          </Button>
        </div>
        {/* Nút tải lại */}
        <div>
          <Button
            onClick={fetchEventCategories}
            variant="contained"
            color="primary"
          >
            Tải lại
          </Button>
        </div>
      </div>
      <div className="w-full px-3">
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) =>
            setSelectedIds(newSelection)
          }
          localeText={viVNGridTranslation}
          sx={{
            height: 480,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          disableMultipleRowSelection
        />
      </div>
      {/* Dialog thêm/chỉnh sửa */}
      {openDialog && (
        <EventCategoryDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          category={editingCategory} // null nếu thêm mới
          refresh={fetchEventCategories} // Làm mới danh sách sau khi thêm/sửa
        />
      )}
    </Paper>
  );
}
