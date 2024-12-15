import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import leaveRequestApi from "../../../api/LeaveRequest"; // Đảm bảo API này tồn tại
import sweetAlert from "../../../utils/sweetAlert";
import useAppContext from "../../../hooks/useAppContext";
import { formatDate } from "../../../utils/formatDate";
import { AuthUser } from "../../../types/authentication";
import { getUserInfo } from "../../../utils/utils";

interface CatechistLeaveRequestDialogProps {
  open: boolean;
  onClose: () => void;
  catechistId: string;
  refreshCatechists: () => void;
}

const CatechistLeaveRequestDialog: React.FC<
  CatechistLeaveRequestDialogProps
> = ({ open, onClose, catechistId, refreshCatechists }) => {
  const { enableLoading, disableLoading } = useAppContext(); // Lấy thông tin người phê duyệt
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userLogin, setUserLogin] = useState<AuthUser>({});
  useEffect(() => {
    const user: AuthUser = getUserInfo();
    if (user && user.id) {
      setUserLogin(user);
    }
  }, []);

  const handleSubmit = async () => {
    if (!reason || !comment) {
      sweetAlert.alertWarning(
        "Lý do xin nghỉ và Ghi chú phê duyệt là bắt buộc!",
        "",
        6000,
        33
      );
      return;
    }

    const confirm = await sweetAlert.confirm(
      "Xác nhận phê duyệt đơn nghỉ giảng dạy",
      "",
      undefined,
      undefined,
      "question"
    );
    if (!confirm) {
      return;
    }

    enableLoading();
    setLoading(true);

    try {
      // Gửi yêu cầu nghỉ
      const submitData = {
        catechistId,
        reason,
        leaveDate: formatDate.getISODateInVietnamTimeZone(),
      };

      const submitResponse =
        await leaveRequestApi.submitLeaveRequest(submitData);

      if (!submitResponse.data) {
        sweetAlert.alertFailed("Gửi yêu cầu nghỉ thất bại!", "", 3000, 26);
        return;
      }

      setTimeout(() => {
        const action = async () => {
          const getAllLeaveRequest = await leaveRequestApi.getLeaveRequests(
            undefined,
            catechistId
          );
          const leaveRequest = getAllLeaveRequest.data.data.filter(
            (item) => item.status == 0
          )[0];

          // Phê duyệt yêu cầu nghỉ
          const processData = {
            requestId: leaveRequest.id,
            approverId: userLogin ? userLogin.id : "",
            status: 1,
            comment,
          };

          const processResponse =
            await leaveRequestApi.processLeaveRequest(processData);

          if (processResponse.data) {
            sweetAlert.alertSuccess(
              "Yêu cầu nghỉ đã được duyệt!",
              "",
              3000,
              26
            );
            refreshCatechists(); // Refresh danh sách catechists
            onClose(); // Đóng dialog sau khi thành công
          } else {
            sweetAlert.alertFailed(
              "Có lỗi khi phê duyệt yêu cầu nghỉ!",
              "",
              3000,
              26
            );
          }
        };
        action();
      }, 1000);
    } catch (error) {
      console.log("Error: ", error);
      sweetAlert.alertFailed("Có lỗi xảy ra!", "", 3000, 22);
    } finally {
      setLoading(false);
      setTimeout(() => {
        disableLoading();
      }, 1000);
    }
  };

  if (!userLogin || !userLogin.id) return <></>;

  return (
    <Dialog open={open} fullWidth>
      <DialogContent>
        <h2 className="font-bold text-[1.5rem]">
          Thông tin đơn xin nghỉ giảng dạy
        </h2>
        <TextField
          label={
            <span>
              Lý do xin nghỉ <span style={{ color: "red" }}>*</span>
            </span>
          }
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3"
        />
        <TextField
          label={
            <span>
              Ghi chú phê duyệt <span style={{ color: "red" }}>*</span>
            </span>
          }
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-3"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="outlined"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Duyệt"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatechistLeaveRequestDialog;
