import React, { useState, useEffect } from "react";
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
import {
  BudgetTransactionResponseItem,
  BudgetTransactionImage,
} from "../../../model/Response/Event";
import viVNGridTranslation from "../../../locale/MUITable";

const BudgetDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  transactions: BudgetTransactionResponseItem[];
  eventName: string;
}> = ({ open, onClose, transactions, eventName }) => {
  const [images, setImages] = useState<BudgetTransactionImage[]>([]);
  const [viewImages, setViewImages] = useState<boolean>(false);

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
    {
      field: "images",
      headerName: "Ảnh chứng minh",
      width: 300,
      renderCell: (params) => (
        <>
          {params.row.transactionImages.length > 0 ? (
            <>
              <span className="inline-block" style={{ paddingRight: "10px" }}>
                {params.row.transactionImages.length} ảnh
              </span>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setImages(params.row.transactionImages);
                  setViewImages(true);
                }}
              >
                Xem ảnh
              </Button>
            </>
          ) : (
            <>
              <span className="inline-block" style={{ paddingRight: "10px" }}>
                Không có ảnh
              </span>
            </>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!viewImages) {
      setImages([]);
    }
  }, [viewImages]);

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
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          localeText={viVNGridTranslation}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Đóng
        </Button>
      </DialogActions>

      <Dialog open={viewImages} fullWidth maxWidth="md">
        <div className="w-full flex flex-wrap justify-center">
          {images
            .sort((a: BudgetTransactionImage, b: BudgetTransactionImage) => {
              return (
                new Date(a.uploadAt).getTime() - new Date(b.uploadAt).getTime()
              );
            })
            .map((image: BudgetTransactionImage) => {
              return (
                <div
                  key={image.id}
                  className="w-[50%] flex flex-col items-center justify-between px-2 my-3"
                >
                  <img
                    src={image.imageUrl ?? ""}
                    alt={image.imageUrl ?? ""}
                    width={350}
                    height={350}
                  />
                  <p className="italic">
                    Thời gian đăng tải:{" "}
                    {formatDate.DD_MM_YYYY_Time(image.uploadAt)}
                  </p>
                </div>
              );
            })}
        </div>

        <Button
          onClick={() => {
            setViewImages(false);
          }}
          color="secondary"
          variant="contained"
        >
          Đóng
        </Button>
      </Dialog>
    </Dialog>
  );
};

export default BudgetDialog;
