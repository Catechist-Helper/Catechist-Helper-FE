import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import eventCategoryApi from "../../../api/EventCategory";
import sweetAlert from "../../../utils/sweetAlert";
import { EventCategoryItemResponse } from "../../../model/Response/EventCategory";

interface EventCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: EventCategoryItemResponse | null; // null nếu thêm mới
  refresh: () => void; // Callback để làm mới danh sách
}

const EventCategoryDialog: React.FC<EventCategoryDialogProps> = ({
  open,
  onClose,
  category,
  refresh,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (category) {
      // Nếu chỉnh sửa, điền sẵn dữ liệu của danh mục vào form
      setName(category.name);
      setDescription(category.description || "");
    } else {
      // Nếu thêm mới, reset form
      setName("");
      setDescription("");
    }
  }, [category]);

  // Hàm xử lý lưu (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    if (!name.trim()) {
      sweetAlert.alertWarning(
        "Tên danh mục không được để trống!",
        "",
        1000,
        22
      );
      return;
    }

    try {
      setLoading(true);
      if (category) {
        // Nếu đang chỉnh sửa
        await eventCategoryApi.updateEventCategory(category.id, {
          name,
          description,
        });
        sweetAlert.alertSuccess("Cập nhật danh mục thành công!", "", 1000, 22);
      } else {
        // Nếu đang thêm mới
        await eventCategoryApi.createEventCategory({
          name,
          description,
        });
        sweetAlert.alertSuccess("Thêm danh mục mới thành công!", "", 1000, 22);
      }
      refresh(); // Làm mới danh sách
      onClose(); // Đóng dialog
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi lưu danh mục!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? "Chỉnh sửa danh mục sự kiện" : "Thêm mới danh mục sự kiện"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSave} color="primary" disabled={loading}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventCategoryDialog;
