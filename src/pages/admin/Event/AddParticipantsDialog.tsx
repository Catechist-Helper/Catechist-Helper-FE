import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import eventApi from "../../../api/Event";
import useAppContext from "../../../hooks/useAppContext";
import sweetAlert from "../../../utils/sweetAlert";

const AddParticipantsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  refresh: () => void;
}> = ({ open, onClose, eventId, eventName, refresh }) => {
  const [file, setFile] = useState<File | null>(null);
  const { enableLoading, disableLoading } = useAppContext();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn một tệp!");
      return;
    }

    const formData = new FormData();
    formData.append("File", file);
    formData.append("EventId", eventId);

    try {
      enableLoading();
      await eventApi.addListParticipants(eventId, formData);
      sweetAlert.alertSuccess("Thêm danh sách thành công!", "", 3000, 24);
      refresh(); // Làm mới danh sách sự kiện
      onClose(); // Đóng dialog
    } catch (error) {
      console.error("Lỗi khi thêm danh sách người tham gia:", error);
      sweetAlert.alertFailed("Thêm danh sách thất bại!", "", 3000, 24);
    } finally {
      disableLoading();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Thêm danh sách người tham gia cho sự kiện <strong>{eventName}</strong>
      </DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Button variant="outlined" component="label">
            Chọn tệp
            <input
              type="file"
              accept=".xlsx, .xls"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {file && <p>Tệp đã chọn: {file.name}</p>}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleUpload} color="primary">
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddParticipantsDialog;
