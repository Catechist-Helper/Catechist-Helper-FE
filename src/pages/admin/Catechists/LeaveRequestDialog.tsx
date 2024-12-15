import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Typography,
} from "@mui/material";
import { GetLeaveRequestItemResponse } from "../../../model/Response/LeaveRequest";
import {
  LeaveRequestStatus,
  LeaveRequestStatusString,
} from "../../../enums/LeaveRequest";
import { formatDate } from "../../../utils/formatDate";

// Interface và enum
interface LeaveRequestDialogProps {
  open: boolean;
  onClose: () => void;
  leaveRequest?: GetLeaveRequestItemResponse;
}

// Dialog Component
const LeaveRequestDialog: React.FC<LeaveRequestDialogProps> = ({
  open,
  onClose,
  leaveRequest,
}) => {
  // Render status
  const renderStatus = (status: number) => {
    switch (status) {
      case LeaveRequestStatus.Pending:
        return LeaveRequestStatusString.Pending;
      case LeaveRequestStatus.Approved:
        return LeaveRequestStatusString.Approved;
      case LeaveRequestStatus.Rejected:
        return LeaveRequestStatusString.Rejected;
      default:
        return "Không xác định";
    }
  };

  if (!leaveRequest) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h6">
          Đơn xin nghỉ giảng dạy của: {leaveRequest.catechistName}
        </Typography>

        {leaveRequest.approvalDate ? (
          <>
            <Typography marginTop={2}>
              <strong>Thời gian phê duyệt:</strong>{" "}
              {formatDate.DD_MM_YYYY_Time(leaveRequest.approvalDate ?? "")}
            </Typography>
          </>
        ) : (
          <></>
        )}

        <Typography marginTop={2}>
          <strong>Lý do:</strong> {leaveRequest.reason}
        </Typography>

        <Typography marginTop={2}>
          <strong>Ghi chú đơn:</strong>{" "}
          {leaveRequest.comment || "Không có ghi chú"}
        </Typography>

        <Typography marginTop={2}>
          <strong>Trạng thái:</strong> {renderStatus(leaveRequest.status)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequestDialog;
