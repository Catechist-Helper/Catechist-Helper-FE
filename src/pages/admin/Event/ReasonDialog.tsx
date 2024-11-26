import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import sweetAlert from "../../../utils/sweetAlert";

const ReasonDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}> = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState<string>("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      sweetAlert.alertWarning("Vui lòng nhập lý do!", "", 1000, 22);
      return;
    }
    onConfirm(reason);
    setReason(""); // Reset lý do sau khi xác nhận
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Lý do thay đổi ngân sách</DialogTitle>
      <DialogContent>
        <TextField
          label="Nhập lý do"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReasonDialog;
