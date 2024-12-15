import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { CatechistSlotResponse } from "../../../model/Response/Class";
import Select from "react-select";
import { formatDate } from "../../../utils/formatDate";
import sweetAlert from "../../../utils/sweetAlert";

interface AdminRequestLeaveDialogProps {
  open: boolean;
  slotId: string;
  date: string;
  catechists: CatechistSlotResponse[];
  onClose: () => void;
  onSubmit: (catechistId: string, reason: string, slotId: string) => void;
}

const AdminRequestLeaveDialog: React.FC<AdminRequestLeaveDialogProps> = ({
  open,
  slotId,
  date,
  catechists,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<string>("");
  const [selectedCateId, setSelectedCateId] = useState<any>({});

  useEffect(() => {
    setReason("");
    setSelectedCateId({});
  }, [slotId, catechists]);

  const handleSubmit = () => {
    if (!(selectedCateId && selectedCateId.value)) {
      sweetAlert.alertWarning(
        "Vui lòng chọn giáo lý viên nghỉ phép",
        "",
        2500,
        28
      );
      return;
    }
    if (!reason || reason.trim() == "") {
      sweetAlert.alertWarning("Vui lòng nhập lý do nghỉ phép", "", 2500, 25);
      return;
    }
    onSubmit(
      selectedCateId && selectedCateId.value ? selectedCateId.value : "",
      reason,
      slotId
    );
    setReason("");
    setSelectedCateId({});
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>
        <h2 className="font-bold text-[1.5rem] text-primary">Xin nghỉ phép</h2>
      </DialogTitle>
      <DialogContent>
        <p className="mb-2 font-bold">
          Ngày nghỉ: {formatDate.DD_MM_YYYY(date)}
        </p>
        <label className="font-bold mt-1">
          Chọn giáo lý viên nghỉ phép <span style={{ color: "red" }}>*</span>
        </label>
        <Select
          options={catechists.map((cate) => ({
            value: cate.catechist.id,
            label: `${cate.catechist.fullName} - ${cate.catechist.code}`,
          }))}
          value={selectedCateId}
          onChange={(newValue: any) =>
            setSelectedCateId(newValue as { value: string; label: string }[])
          }
          placeholder="Tìm kiếm và chọn người phỏng vấn..."
          className="mt-1 z-[999]"
        />
        <TextField
          label={
            <span>
              Lý do nghỉ phép <span style={{ color: "red" }}>*</span>
            </span>
          }
          multiline
          fullWidth
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3"
        />
        <DialogActions className="mt-3">
          <Button onClick={onClose} color="primary" variant="outlined">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRequestLeaveDialog;
