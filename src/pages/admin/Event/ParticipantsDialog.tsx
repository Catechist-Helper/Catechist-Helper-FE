import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ParticipantResponseItem } from "../../../model/Response/Event";
import { formatDate } from "../../../utils/formatDate";

const ParticipantsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  participants: ParticipantResponseItem[];
  eventName: string;
}> = ({ open, onClose, participants, eventName }) => {
  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Họ tên", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Số điện thoại", width: 150 },
    { field: "gender", headerName: "Giới tính", width: 120 },
    {
      field: "dateOfBirth",
      headerName: "Ngày sinh",
      width: 150,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.row.dateOfBirth),
    },
    { field: "address", headerName: "Địa chỉ", width: 250 },
    // {
    //   field: "isAttended",
    //   headerName: "Đã tham dự",
    //   width: 150,
    //   renderCell: (params) => (params.row.isAttended ? "Có" : "Không"),
    // },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        Thông tin người tham gia của sự kiện <strong>{eventName}</strong>
      </DialogTitle>
      <DialogContent>
        <DataGrid
          rows={participants.map((participant) => ({
            ...participant,
            id: participant.id,
          }))}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParticipantsDialog;
