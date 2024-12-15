import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import absenceApi from "../../../api/AbsenceRequest";
import { GetAbsenceItemResponse } from "../../../model/Response/AbsenceRequest";
import { formatDate } from "../../../utils/formatDate";
import viVNGridTranslation from "../../../locale/MUITable";
import { Button } from "@mui/material";
import { getUserInfo } from "../../../utils/utils";
import {
  AbsenceRequestStatus,
  AbsenceRequestStatusString,
} from "../../../enums/AbsenceRequest";
import ApprovalDialog from "./ApprovalDialog";
import ViewDetailAbsenceDialog from "./ViewDetailAbsenceDialog";
import catechistApi from "../../../api/Catechist";

const AbsencePage = () => {
  const [absences, setAbsences] = useState<GetAbsenceItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [selectedAbsences, setSelectedAbsences] =
    useState<GridRowSelectionModel>([]);
  const [userLogin, setUserLogin] = useState<any>(null); // Store user login info
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openViewDetailDialog, setOpenViewDetailDialog] =
    useState<boolean>(false);
  const [selectedAbsence, setSelectedAbsence] =
    useState<GetAbsenceItemResponse | null>(null); // Selected absence for approval

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userLoggedin = getUserInfo(); // Get user info
        setUserLogin(userLoggedin);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, []);

  // Cấu hình các cột trong DataGrid
  const columns: GridColDef[] = [
    {
      field: "catechistName",
      headerName: "Giáo lý viên xin nghỉ",
      width: 250,
      renderCell: (params) => (
        <>
          {params.row.catechistAbsence.fullName}{" "}
          {`(${params.row.catechistAbsence.code})`}
        </>
      ),
    },
    {
      field: "createAt",
      headerName: "Thời gian gửi đơn",
      width: 180,
      renderCell: (params) => formatDate.DD_MM_YYYY_Time(params.value),
    },
    {
      field: "slot.className",
      headerName: "Tên lớp",
      width: 180,
      renderCell: (params) =>
        params.row.slot && params.row.slot.className
          ? params.row.slot.className
          : "",
    },
    {
      field: "slot.date",
      headerName: "Ngày vắng",
      width: 180,
      renderCell: (params) =>
        params.row.slot && params.row.slot.date
          ? formatDate.DD_MM_YYYY(params.row.slot.date)
          : "",
    },
    { field: "reason", headerName: "Lý do", width: 200 },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (params) => {
        switch (params.value) {
          case AbsenceRequestStatus.Pending:
            return (
              <span className="px-2 py-1 rounded-xl bg-warning text-black">
                {AbsenceRequestStatusString.Pending}
              </span>
            );
          case AbsenceRequestStatus.Approved:
            return (
              <span className="px-2 py-1 rounded-xl bg-success text-white">
                {AbsenceRequestStatusString.Approved}
              </span>
            );
          case AbsenceRequestStatus.Rejected:
            return (
              <span className="px-2 py-1 rounded-xl bg-danger text-white">
                {AbsenceRequestStatusString.Rejected}
              </span>
            );
          default:
            return <></>;
        }
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 180,
      renderCell: (params) => {
        return params.row.status == AbsenceRequestStatus.Pending ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedAbsence(params.row);
                setOpenDialog(true);
              }}
            >
              Phê duyệt
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setSelectedAbsence(params.row);
                setOpenViewDetailDialog(true);
              }}
            >
              Xem phê duyệt
            </Button>
          </>
        );
      },
    },
    {
      field: "cateReplace",
      headerName: "Giáo lý viên thay thế",
      width: 300,
      renderCell: (params) => {
        if (params.row.status == AbsenceRequestStatus.Rejected) {
          return <></>;
        }
        if (params.row.status == AbsenceRequestStatus.Pending) {
          return <>Chờ duyệt đơn</>;
        }
        if (
          params.row.status == AbsenceRequestStatus.Approved &&
          !params.row.catechistReplace
        ) {
          if (
            new Date(params.row.slot.date).getTime() - new Date().getTime() <
            0
          ) {
            return <>Không có</>;
          }
          return (
            <div className="flex gap-x-2">
              <p>Chưa có</p>
              <div>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSelectedAbsence(params.row);
                    setOpenDialog(true);
                  }}
                >
                  Chọn
                </Button>
              </div>
            </div>
          );
        }

        if (
          params.row.status == AbsenceRequestStatus.Approved &&
          params.row.catechistReplace
        ) {
          console.log("catechistReplace", params.row.catechistReplace);
          return (
            <>
              {params.row.catechistReplace.fullName}{" "}
              {`(${params.row.catechistReplace.code})`}
            </>
          );
        }
      },
    },
  ];

  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const response = await absenceApi.getAbsences(); // Gọi API

      const updatedRows = await Promise.all(
        response.data.data.map(async (item) => {
          let cateProfile: any = null;
          let cateAbsenceProfile: any = null;
          const res2 = await catechistApi.getCatechistById(item.catechistId);
          cateAbsenceProfile = res2.data.data;
          if (item.replacementCatechistId) {
            const res = await catechistApi.getCatechistById(
              item.replacementCatechistId
            );
            cateProfile = res.data.data;
          }
          return {
            ...item,
            catechistReplace: cateProfile,
            catechistAbsence: cateAbsenceProfile,
          };
        })
      );

      setAbsences(
        updatedRows.sort(
          (a, b) =>
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching absences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedAbsences(newSelectionModel);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    fetchAbsences();
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Danh sách đơn xin nghỉ phép
      </h1>
      <div className="my-2 flex justify-between mx-3">
        <div className="min-w-[10px]"></div>
        <div className="flex gap-x-2">
          <Button
            onClick={() => fetchAbsences()}
            variant="contained"
            color="primary"
            style={{ marginBottom: "16px" }}
          >
            Tải lại
          </Button>
        </div>
      </div>
      <DataGrid
        rows={absences}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        paginationMode="client"
        initialState={{ pagination: { paginationModel } }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel} // Cập nhật paginationModel khi thay đổi
        pageSizeOptions={[8, 25, 50]}
        onRowSelectionModelChange={handleSelectionChange}
        rowSelectionModel={selectedAbsences}
        checkboxSelection
        sx={{
          border: 0,
        }}
        localeText={viVNGridTranslation}
        disableRowSelectionOnClick
      />
      {openDialog && selectedAbsence && (
        <ApprovalDialog
          open={openDialog}
          onClose={handleCloseDialog}
          absence={selectedAbsence}
          approverId={userLogin?.id || ""}
        />
      )}
      {openViewDetailDialog && selectedAbsence && (
        <ViewDetailAbsenceDialog
          open={openViewDetailDialog}
          onClose={() => setOpenViewDetailDialog(false)}
          absence={selectedAbsence}
        />
      )}
    </Paper>
  );
};

export default AbsencePage;
