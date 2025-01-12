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
  // LeaveRequestStatusString,
} from "../../../enums/LeaveRequest";
import { formatDate } from "../../../utils/formatDate";
import { CatechistItemResponse } from "../../../model/Response/Catechist";

// Interface và enum
interface LeaveRequestDialogProps {
  open: boolean;
  onClose: () => void;
  leaveRequests?: GetLeaveRequestItemResponse[];
  catechist?: CatechistItemResponse | null;
}

// Dialog Component
const LeaveRequestDialog: React.FC<LeaveRequestDialogProps> = ({
  open,
  onClose,
  leaveRequests,
  catechist,
}) => {
  // Render status
  // const renderStatus = (status: number) => {
  //   switch (status) {
  //     case LeaveRequestStatus.Pending:
  //       return LeaveRequestStatusString.Pending;
  //     case LeaveRequestStatus.Approved_For_Resign:
  //       return LeaveRequestStatusString.Approved_For_Resign;
  //     case LeaveRequestStatus.Back_For_Teaching:
  //       return LeaveRequestStatusString.Back_For_Teaching;
  //     default:
  //       return "Không xác định";
  //   }
  // };

  if (!leaveRequests) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Typography variant="h5" marginBottom={1} paddingBottom={2}>
          <p className="text-secondary text-center">
            Thông tin thay đổi trạng thái giảng dạy của <br />{" "}
            <span className="font-bold">
              {leaveRequests[0] ? leaveRequests[0].catechistName : ""}
              {catechist && catechist.code ? " (" + catechist.code + ")" : ""}
            </span>
          </p>
        </Typography>
        <hr />
        {leaveRequests.map((leaveRequest) => {
          return (
            <div key={leaveRequest.id}>
              {leaveRequest.status == LeaveRequestStatus.Approved_For_Resign ? (
                <>
                  <Typography
                    marginTop={2}
                    variant="h6"
                    className="text-danger"
                    fontWeight={"bold"}
                  >
                    Đơn xin nghỉ giảng dạy
                  </Typography>
                </>
              ) : (
                <></>
              )}
              {leaveRequest.status == LeaveRequestStatus.Back_For_Teaching ? (
                <Typography
                  marginTop={2}
                  variant="h6"
                  className="text-primary"
                  fontWeight={"bold"}
                >
                  Đơn xin quay lại giảng dạy
                </Typography>
              ) : (
                <></>
              )}
              {leaveRequest.approvalDate ? (
                <>
                  <Typography marginTop={2}>
                    <strong>Thời gian phê duyệt:</strong>{" "}
                    {formatDate.DD_MM_YYYY_Time(
                      leaveRequest.approvalDate ?? ""
                    )}
                  </Typography>
                </>
              ) : (
                <></>
              )}

              <Typography marginTop={2}>
                <strong>Lý do:</strong> {leaveRequest.reason}
              </Typography>

              <Typography marginTop={2}>
                <strong>Ghi chú phê duyệt:</strong>{" "}
                {leaveRequest.comment || "Không có ghi chú"}
              </Typography>

              {/* <Typography marginTop={2}>
                <strong>Trạng thái:</strong> {renderStatus(leaveRequest.status)}
              </Typography> */}
              <hr className="mt-3" />
            </div>
          );
        })}
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
