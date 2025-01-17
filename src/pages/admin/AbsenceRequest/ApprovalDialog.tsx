import { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";

import {
  AbsenceRequestStatus,
  AbsenceRequestStatusString,
} from "../../../enums/AbsenceRequest";
import absenceApi from "../../../api/AbsenceRequest";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AssignReplacementRequest } from "../../../model/Request/AbsenceRequest";
import sweetAlert from "../../../utils/sweetAlert";
import { CatechistInSlotTypeEnumNumber } from "../../../enums/CatechistInSlot";
import { GetAbsenceItemResponse } from "../../../model/Response/AbsenceRequest";
import useAppContext from "../../../hooks/useAppContext";
import viVNGridTranslation from "../../../locale/MUITable";
import catechistInSlotApi from "../../../api/CatechistInSlot";

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  absence: GetAbsenceItemResponse; // The selected absence request
  approverId: string; // The ID of the approver (user logged in)
}

const ApprovalDialog = ({
  open,
  onClose,
  absence,
  approverId,
}: ApprovalDialogProps) => {
  const [status, setStatus] = useState<AbsenceRequestStatus>(
    AbsenceRequestStatus.Pending
  );
  const [comment, setComment] = useState<string>("");
  const [replacementCatechists, setReplacementCatechists] = useState<any[]>([]);
  const [selectedReplacementId, setSelectedReplacementId] = useState<
    string | null
  >(null); // ID người thay thế được chọn

  useEffect(() => {
    const fetchReplacementCatechists = async () => {
      if (absence?.id) {
        try {
          const response = await catechistInSlotApi.findAvailableCatesExcludeId(
            absence.slot.id,
            1,
            1000
          );
          setReplacementCatechists(
            response.data.data.items.filter(
              (item) => item.id != absence.catechistId
            )
          );
        } catch (error) {
          console.error("Error fetching replacement catechists:", error);
        }
      }
    };

    fetchReplacementCatechists();
  }, [absence]);
  const { enableLoading, disableLoading } = useAppContext();
  // Handle phê duyệt đơn nghỉ phép
  const handleApproval = async () => {
    try {
      if (absence.status == AbsenceRequestStatus.Pending) {
        if (
          status != AbsenceRequestStatus.Approved &&
          status != AbsenceRequestStatus.Rejected
        ) {
          sweetAlert.alertWarning(
            "Vui lòng chọn kết quả phê duyệt nghỉ phép",
            "",
            2500,
            32
          );

          return;
        }

        if (comment.trim() == "") {
          sweetAlert.alertWarning(
            "Vui lòng nhập ghi chú duyệt nghỉ phép",
            "",
            2500,
            30
          );

          return;
        }
        enableLoading();
        await absenceApi.processAbsence({
          requestId: absence.id,
          approverId: approverId,
          status: status,
          comment: comment,
        });
      }

      // Gọi API chỉ định người thay thế
      if (selectedReplacementId) {
        const assignRequest: AssignReplacementRequest = {
          requestId: absence.id,
          replacementCatechistId: selectedReplacementId,
          type: CatechistInSlotTypeEnumNumber.Substitute,
        };

        await absenceApi.assignReplacement(assignRequest);
      }

      // Đóng dialog và thực hiện các hành động cần thiết sau khi phê duyệt và chỉ định người thay thế
      onClose();
      if (absence.status == AbsenceRequestStatus.Pending) {
        sweetAlert.alertSuccess("Phê duyệt thành công", "", 1200, 22);
      } else {
        sweetAlert.alertSuccess(
          "Chọn giáo lý viên thay thế thành công",
          "",
          1200,
          26
        );
      }
    } catch (error) {
      console.error("Error processing absence:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi phê duyệt", "", 1200, 25);
    } finally {
      disableLoading();
    }
  };

  // Cấu hình DataGrid cho người thay thế
  const columns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 80,
      renderCell: (params) => (
        <img
          src={
            params.row.imageUrl
              ? params.row.imageUrl
              : "https://firebasestorage.googleapis.com/v0/b/catechisthelper-1f8af.appspot.com/o/defaultAvatar%2FDefaultAvatar.png?alt=media&token=e117852a-f40f-47d8-9801-b802e438de96"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    { field: "code", headerName: "Mã giáo viên", width: 110 },
    { field: "christianName", headerName: "Tên Thánh", width: 230 },
    { field: "fullName", headerName: "Họ và tên", width: 200 },
    { field: "level", headerName: "Cấp bậc", width: 110 },
    { field: "major", headerName: "Ngành", width: 110 },
    { field: "grade", headerName: "Khối", width: 120 },
    {
      field: "replace",
      headerName: "Thay thế",
      width: 120,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.id === selectedReplacementId}
          onChange={() => setSelectedReplacementId(params.row.id)}
        />
      ),
    },
  ];

  useEffect(() => {
    if (status != AbsenceRequestStatus.Approved) {
      setSelectedReplacementId(null);
    }
  }, [status]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        {absence.status == AbsenceRequestStatus.Pending
          ? "Phê duyệt đơn nghỉ phép"
          : ""}
      </DialogTitle>
      <DialogContent>
        {absence.status == AbsenceRequestStatus.Pending ? (
          <>
            <label htmlFor="" className="ml-1">
              Quyết định phê duyệt <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              fullWidth
              variant="outlined"
              className={`${status == AbsenceRequestStatus.Approved ? "bg-success text-white" : ""}
          ${status == AbsenceRequestStatus.Rejected ? "bg-danger text-white" : ""}`}
            >
              <MenuItem
                value={AbsenceRequestStatus.Approved}
                className="bg-success text-white py-3"
              >
                {AbsenceRequestStatusString.Approved}
              </MenuItem>
              <MenuItem
                value={AbsenceRequestStatus.Rejected}
                className="bg-danger text-white py-3"
              >
                {AbsenceRequestStatusString.Rejected}
              </MenuItem>
            </Select>
            <TextField
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              label={
                <span>
                  Nhập ghi chú <span style={{ color: "red" }}>*</span>
                </span>
              }
              fullWidth
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
              style={{ margin: "0", marginTop: "25px" }}
            />
          </>
        ) : (
          <></>
        )}

        {status == AbsenceRequestStatus.Approved ||
        absence.status != AbsenceRequestStatus.Pending ? (
          <>
            <div className="mt-3">
              <label htmlFor="" className="mt-1 mb-2 ml-1 font-bold">
                Chọn giáo lý viên thay thế
              </label>
              <DataGrid
                rows={replacementCatechists}
                columns={columns}
                paginationMode="client"
                disableRowSelectionOnClick
                localeText={viVNGridTranslation}
                sx={{
                  minHeight: 100,
                  maxHeight: 330,
                  overflowX: "auto",
                  "& .MuiDataGrid-root": {
                    overflowX: "auto",
                  },
                }}
              />
            </div>
          </>
        ) : (
          <></>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy bỏ
        </Button>
        <Button onClick={handleApproval} color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalDialog;
