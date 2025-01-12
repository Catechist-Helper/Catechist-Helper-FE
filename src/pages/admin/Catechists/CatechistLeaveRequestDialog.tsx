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
import { CatechistItemResponse } from "../../../model/Response/Catechist";
import CatechistDetailDialog from "./CatechistDetailDialog";
import { LeaveRequestStatus } from "../../../enums/LeaveRequest";

interface CatechistLeaveRequestDialogProps {
  open: boolean;
  onClose: () => void;
  catechistId: string;
  catechist?: CatechistItemResponse | null;
  refreshCatechists: () => void;
}

const CatechistLeaveRequestDialog: React.FC<
  CatechistLeaveRequestDialogProps
> = ({ open, onClose, catechistId, catechist, refreshCatechists }) => {
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
    if (!reason || !comment || reason.trim() == "" || comment.trim() == "") {
      sweetAlert.alertWarning(
        "Lý do và ghi chú phê duyệt là bắt buộc!",
        "",
        6000,
        30
      );
      return;
    }

    if (catechist && catechist.isTeaching) {
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
    } else if (catechist && !catechist.isTeaching) {
      const confirm2 = await sweetAlert.confirm(
        "Xác nhận phê duyệt đơn xin quay lại giảng dạy",
        "",
        undefined,
        undefined,
        "question"
      );
      if (!confirm2) {
        return;
      }
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
            (item) => item.status == LeaveRequestStatus.Pending
          )[0];

          // Phê duyệt yêu cầu nghỉ
          const processData = {
            requestId: leaveRequest.id,
            approverId: userLogin ? userLogin.id : "",
            status: LeaveRequestStatus.Approved_For_Resign,
            comment,
          };

          if (catechist && !catechist.isTeaching) {
            processData.status = LeaveRequestStatus.Back_For_Teaching;
          }

          const processResponse =
            await leaveRequestApi.processLeaveRequest(processData);

          if (processResponse.data) {
            sweetAlert.alertSuccess(
              "Yêu cầu đã được phê duyệt thành công",
              "",
              3000,
              30
            );
            refreshCatechists(); // Refresh danh sách catechists
            onClose(); // Đóng dialog sau khi thành công
          } else {
            sweetAlert.alertFailed(
              "Có lỗi khi phê duyệt yêu cầu",
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
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogContent>
        <h2 className="font-bold text-[1.5rem]">
          {catechist && catechist.isTeaching ? (
            <span className="text-danger">
              Thông tin đơn xin nghỉ giảng dạy
            </span>
          ) : (
            ""
          )}{" "}
          {catechist && !catechist.isTeaching ? (
            <span className="text-primary">
              Thông tin đơn xin quay lại giảng dạy
            </span>
          ) : (
            ""
          )}
        </h2>
        <CatechistDetailDialog
          catechistId={catechistId}
          open={true}
          onClose={() => {}}
          viewing={true}
        />
        <TextField
          label={
            <span>
              {catechist && catechist.isTeaching ? (
                <span>Lý do xin nghỉ</span>
              ) : (
                ""
              )}{" "}
              {catechist && !catechist.isTeaching ? (
                <span>Lý do xin quay lại giảng dạy</span>
              ) : (
                ""
              )}
              <span style={{ color: "red" }}>*</span>
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
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="outlined"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Duyệt"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatechistLeaveRequestDialog;
