import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import levelApi from "../../../api/Level"; // Import API
import majorApi from "../../../api/Major"; // Import API
import sweetAlert from "../../../utils/sweetAlert"; // Alert tiện ích

interface AddLevelDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: any; // Dữ liệu của ngành được chọn
  refreshData: () => void; // Hàm để refresh dữ liệu sau khi cập nhật
}

const AddLevelDialog: React.FC<AddLevelDialogProps> = ({
  open,
  onClose,
  selectedRow,
  refreshData,
}) => {
  const [levelList, setLevelList] = useState<any[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  // Lấy danh sách cấp độ từ API
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await levelApi.getAllLevel();
        setLevelList(res.data.data.items);
      } catch (error) {
        console.error("Lỗi khi lấy cấp độ:", error);
        sweetAlert.alertFailed("Lỗi khi tải danh sách cấp độ", "", 2000, 22);
      }
    };
    fetchLevels();
  }, []);

  // Xử lý xác nhận
  const handleConfirm = async () => {
    if (!selectedLevelId) {
      sweetAlert.alertFailed("Vui lòng chọn cấp độ", "", 2000, 23);
      return;
    }
    try {
      await majorApi.assignLevelToMajor(selectedRow.id, selectedLevelId);
      sweetAlert.alertSuccess("Thêm cấp bậc thành công", "", 2000, 25);
      refreshData(); // Làm mới danh sách chính
      onClose(); // Đóng dialog
    } catch (error) {
      console.error("Lỗi khi thêm cấp bậc:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi thêm cấp bậc", "", 2000, 27);
    }
  };
  console.log("levelList", levelList);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm cấp bậc cho ngành {selectedRow?.name}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>
            <span>
              Cấp độ <span style={{ color: "red" }}>*</span>
            </span>
          </InputLabel>
          <Select
            value={selectedLevelId}
            label={
              <span>
                Cấp độ <span style={{ color: "red" }}>*</span>
              </span>
            }
            onChange={(e) => setSelectedLevelId(e.target.value as string)}
          >
            {levelList.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {`${level.name} - Cấp độ giáo lý: ${level.hierarchyLevel}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="outlined" color="primary" onClick={handleConfirm}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLevelDialog;
