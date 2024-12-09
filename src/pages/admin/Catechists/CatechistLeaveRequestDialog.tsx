import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
    enableLoading();
    if (!reason || !comment) {
      sweetAlert.alertFailed(
        "Lý do xin nghỉ và Ghi chú phê duyệt là bắt buộc!",
        "",
        1000,
        22
      );
      return;
    }

    setLoading(true);

    try {
      // Gửi yêu cầu nghỉ
      const submitData = {
        catechistId,
        reason,
        leaveDate: formatDate.getISODateInVietnamTimeZone(), // Ngày hôm nay dạng ISOString
      };
      console.log("aaaa", submitData, {
        requestId: "hehe",
        approverId: userLogin ? userLogin.id : "",
        status: 1,
        comment,
      });

      const submitResponse =
        await leaveRequestApi.submitLeaveRequest(submitData);

      if (!submitResponse.data) {
        sweetAlert.alertFailed("Gửi yêu cầu nghỉ thất bại!", "", 1000, 22);
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
              1000,
              22
            );
            refreshCatechists(); // Refresh danh sách catechists
            onClose(); // Đóng dialog sau khi thành công
          } else {
            sweetAlert.alertFailed(
              "Có lỗi khi phê duyệt yêu cầu nghỉ!",
              "",
              1000,
              22
            );
          }
        };
        action();
      }, 1000);
    } catch (error) {
      console.log("Error: ", error);
      sweetAlert.alertFailed("Có lỗi xảy ra!", "", 1000, 22);
    } finally {
      setLoading(false);
      disableLoading();
    }
  };

  if (!userLogin || !userLogin.id) return <></>;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Thông tin đơn xin nghỉ</DialogTitle>
      <DialogContent>
        <TextField
          label="Lý do xin nghỉ"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <TextField
          label="Ghi chú phê duyệt"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Duyệt"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatechistLeaveRequestDialog;
