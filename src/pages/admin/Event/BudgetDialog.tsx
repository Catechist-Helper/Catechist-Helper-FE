import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatDate } from "../../../utils/formatDate";
import { formatPrice } from "../../../utils/formatPrice";
import { BudgetTransactionResponseItem } from "../../../model/Response/Event";

const BudgetDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  transactions: BudgetTransactionResponseItem[];
  eventName: string;
}> = ({ open, onClose, transactions, eventName }) => {
  const columns: GridColDef[] = [
    {
      field: "transactionAt",
      headerName: "Thời gian giao dịch",
      width: 200,
      renderCell: (params) =>
        formatDate.DD_MM_YYYY_Time(params.row.transactionAt),
    },
    {
      field: "fromBudget",
      headerName: "Ngân sách trước",
      width: 180,
      renderCell: (params) => `${formatPrice(params.row.fromBudget)} ₫`,
    },
    {
      field: "toBudget",
      headerName: "Ngân sách sau",
      width: 180,
      renderCell: (params) => `${formatPrice(params.row.toBudget)} ₫`,
    },
    {
      field: "note",
      headerName: "Ghi chú",
      width: 300,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Giao dịch ngân sách của sự kiện {eventName}</DialogTitle>
      <DialogContent>
        <DataGrid
          rows={transactions
            .sort((a: any, b: any) => {
              return (
                new Date(a.transactionAt).getTime() -
                new Date(b.transactionAt).getTime()
              );
            })
            .map((transaction) => ({
              ...transaction,
              id: transaction.id,
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

export default BudgetDialog;
