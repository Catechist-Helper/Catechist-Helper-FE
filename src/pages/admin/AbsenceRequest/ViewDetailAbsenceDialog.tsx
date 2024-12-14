import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { GetAbsenceItemResponse } from "../../../model/Response/AbsenceRequest";
import { formatDate } from "../../../utils/formatDate";
import {
  AbsenceRequestStatusString,
  AbsenceRequestStatus,
} from "../../../enums/AbsenceRequest";

// Dialog hiển thị chi tiết của đơn nghỉ phép
const ViewDetailAbsenceDialog = ({
  open,
  onClose,
  absence,
}: {
  open: boolean;
  onClose: () => void;
  absence: GetAbsenceItemResponse | null;
}) => {
  if (!absence) return null; // Trả về null nếu absence không tồn tại
  console.log("absence,absence", absence);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h1 className="pb-0 mb-0 mt-2 text-[1.5rem] font-bold">
              Chi tiết đơn nghỉ phép
            </h1>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>Tên giáo lý viên:</strong> {absence.catechistName}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>Thời gian gửi đơn:</strong>{" "}
              {formatDate.DD_MM_YYYY_Time(absence.createAt)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>Trạng thái:</strong>{" "}
              {
                AbsenceRequestStatusString[
                  AbsenceRequestStatus[
                    absence.status
                  ] as keyof typeof AbsenceRequestStatusString
                ]
              }
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              {absence.status != AbsenceRequestStatus.Pending ? (
                <>
                  <strong>Ngày phê duyệt:</strong>{" "}
                  {absence.approvalDate
                    ? formatDate.DD_MM_YYYY(absence.approvalDate)
                    : "Chưa phê duyệt"}
                </>
              ) : (
                <></>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Lý do xin nghỉ:</strong> {absence.reason}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {absence.status != AbsenceRequestStatus.Pending ? (
              <>
                <Typography variant="body1">
                  <strong>Ghi chú phê duyệt:</strong>{" "}
                  {absence.comment || "Không có ghi chú"}
                </Typography>
              </>
            ) : (
              <></>
            )}
          </Grid>
          <hr />
          <Grid item xs={12}>
            <h1 className="pb-0 mb-0 mt-2 text-[1.5rem] font-bold">
              Thông tin tiết học xin nghỉ
            </h1>
          </Grid>
          {absence.slot && (
            <>
              <Grid item xs={4}>
                <Typography variant="body1">
                  <strong>Tên lớp:</strong> {absence.slot.className}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1">
                  <strong>Ngày vắng:</strong>{" "}
                  {formatDate.DD_MM_YYYY(absence.slot.date)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1">
                  <strong>Giờ học:</strong>{" "}
                  {`${formatDate.HH_mm(absence.slot.startTime)} - ${formatDate.HH_mm(absence.slot.endTime)}`}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDetailAbsenceDialog;
