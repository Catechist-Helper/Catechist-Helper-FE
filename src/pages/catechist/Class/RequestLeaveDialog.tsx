import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

interface RequestLeaveDialogProps {
  open: boolean;
  slotId: string;
  onClose: () => void;
  onSubmit: (reason: string, slotId: string) => void;
}

const RequestLeaveDialog: React.FC<RequestLeaveDialogProps> = ({
  open,
  slotId,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<string>("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason, slotId); // Call the onSubmit function with the reason
      setReason(""); // Clear the reason input
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>Xin nghỉ phép</DialogTitle>
      <DialogContent>
        <TextField
          label="Lý do nghỉ phép"
          multiline
          fullWidth
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2"
        />
        <DialogActions className="mt-3">
          <Button onClick={onClose} color="primary" variant="outlined">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default RequestLeaveDialog;
