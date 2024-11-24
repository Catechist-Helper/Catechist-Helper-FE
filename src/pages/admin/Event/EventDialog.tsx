import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import eventApi from "../../../api/Event";
import eventCategoryApi from "../../../api/EventCategory";
import sweetAlert from "../../../utils/sweetAlert";
import { EventItemResponse } from "../../../model/Response/Event";
import { EventCategoryItemResponse } from "../../../model/Response/EventCategory";

// Hàm format từ ISO thành YYYY-MM-DD
const formatToDateInput = (isoString: string | undefined): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toISOString().split("T")[0];
};

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event?: EventItemResponse | any; // null nếu thêm mới
  refresh: () => void; // Callback để làm mới danh sách
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  event,
  refresh,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startTime, setStartTime] = useState<string>(""); // YYYY-MM-DD
  const [endTime, setEndTime] = useState<string>(""); // YYYY-MM-DD
  const [currentBudget, setCurrentBudget] = useState<number>(0);
  const [eventCategories, setEventCategories] = useState<
    EventCategoryItemResponse[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [isPeriodic, setIsPeriodic] = useState<boolean>(false);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch event categories
  const fetchEventCategories = async () => {
    try {
      const { data } = await eventCategoryApi.getAllEventCategories();
      setEventCategories(data.data.items);
    } catch (error) {
      console.error("Lỗi khi tải danh mục sự kiện:", error);
    }
  };

  useEffect(() => {
    fetchEventCategories();
  }, []);

  useEffect(() => {
    if (event) {
      // Nếu chỉnh sửa, điền sẵn dữ liệu của sự kiện
      setName(event.name);
      setDescription(event.description || "");
      setStartTime(formatToDateInput(event.startTime)); // Chuyển đổi thành YYYY-MM-DD
      setEndTime(formatToDateInput(event.endTime)); // Chuyển đổi thành YYYY-MM-DD
      setCurrentBudget(event.current_budget || 0);
      setSelectedCategoryId(event.eventCategory?.id || null);
      setIsPeriodic(event.isPeriodic || false);
      setIsCheckedIn(event.isCheckedIn || false);
      setAddress(event.address || "");
    } else {
      // Nếu thêm mới, reset form
      setName("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setCurrentBudget(0);
      setSelectedCategoryId(null);
      setIsPeriodic(false);
      setIsCheckedIn(false);
      setAddress("");
    }
  }, [event]);

  const handleSave = async () => {
    if (!name.trim()) {
      sweetAlert.alertWarning("Tên sự kiện không được để trống!", "", 1000, 22);
      return;
    }

    if (!selectedCategoryId) {
      sweetAlert.alertWarning("Vui lòng chọn danh mục sự kiện!", "", 1000, 22);
      return;
    }

    if (!address.trim()) {
      sweetAlert.alertWarning("Địa chỉ không được để trống!", "", 1000, 22);
      return;
    }

    if (new Date(startTime) <= new Date()) {
      sweetAlert.alertWarning(
        "Thời gian bắt đầu phải sau ngày hiện tại!",
        "",
        1000,
        22
      );
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      sweetAlert.alertWarning(
        "Thời gian kết thúc phải sau thời gian bắt đầu!",
        "",
        1000,
        22
      );
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        name,
        description,
        isPeriodic,
        isCheckedIn,
        address,
        startTime: new Date(startTime).toISOString(), // Chuyển đổi về ISO trước khi gửi
        endTime: new Date(endTime).toISOString(), // Chuyển đổi về ISO trước khi gửi
        currentBudget: currentBudget,
        eventStatus: 0,
        eventCategoryId: selectedCategoryId,
      };

      if (event) {
        // Nếu chỉnh sửa
        await eventApi.updateEvent(event.id, dataToSend);
        sweetAlert.alertSuccess("Cập nhật sự kiện thành công!", "", 1000, 22);
      } else {
        // Nếu thêm mới
        await eventApi.createEvent(dataToSend);
        sweetAlert.alertSuccess("Thêm sự kiện mới thành công!", "", 1000, 22);
      }
      refresh(); // Làm mới danh sách sự kiện
      onClose(); // Đóng dialog
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi lưu sự kiện!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {event ? "Chỉnh sửa sự kiện" : "Thêm mới sự kiện"}
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Danh mục sự kiện</InputLabel>
          <Select
            value={selectedCategoryId || ""}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            label="Danh mục sự kiện"
            disabled={loading}
          >
            {eventCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Tên sự kiện"
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
        <TextField
          label="Thời gian bắt đầu"
          type="date"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={loading}
        />
        <TextField
          label="Thời gian kết thúc"
          type="date"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={loading}
        />
        <TextField
          label="Địa chỉ tổ chức"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="Ngân sách hiện tại"
          type="number"
          value={currentBudget}
          onChange={(e) => setCurrentBudget(Number(e.target.value))}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isPeriodic}
              onChange={(e) => setIsPeriodic(e.target.checked)}
              disabled={loading}
            />
          }
          label="Sự kiện định kì"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isCheckedIn}
              onChange={(e) => setIsCheckedIn(e.target.checked)}
              disabled={loading}
            />
          }
          label="Có điểm danh"
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

export default EventDialog;
