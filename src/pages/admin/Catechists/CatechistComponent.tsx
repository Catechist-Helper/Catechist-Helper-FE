import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import catechistApi from "../../../api/Catechist";
import { CatechistItemResponse } from "../../../model/Response/Catechist";
import { formatPhone, storeCurrentPath } from "../../../utils/utils";
import viVNGridTranslation from "../../../locale/MUITable";
import sweetAlert from "../../../utils/sweetAlert";
import { formatDate } from "../../../utils/formatDate";
import CatechistDialog from "./CatechistDialog";
import timetableApi from "../../../api/Timetable";
import catechistInClassApi from "../../../api/CatechistInClass";
import FileSaver from "file-saver";
import useAppContext from "../../../hooks/useAppContext";
import CatechistLeaveRequestDialog from "./CatechistLeaveRequestDialog";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { PATH_ADMIN } from "../../../routes/paths";
import LeaveRequestDialog from "./LeaveRequestDialog";
import { GetLeaveRequestItemResponse } from "../../../model/Response/LeaveRequest";
import leaveRequestApi from "../../../api/LeaveRequest";
import { LeaveRequestStatus } from "../../../enums/LeaveRequest";
import CatechistDetailDialog from "./CatechistDetailDialog";

export default function CatechistComponent() {
  const [rows, setRows] = useState<CatechistItemResponse[]>([]);
  const [selectedUpdateCatechist, setSelectedUpdateCatechist] =
    useState<CatechistItemResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 50, // Default page size
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [updateMode, setUpdateMode] = useState<boolean>(false);
  const { enableLoading, disableLoading } = useAppContext();
  const [selectedCatechist, setSelectedCatechist] =
    useState<CatechistItemResponse | null>(null); // Catechist đang chọn
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // Mở dialog
  const [statusIsTeaching, setStatusIsTeaching] = useState<any>({
    value: true,
    label: "Đang hoạt động",
  });
  const [totalCate, setTotalCate] = useState<number>(0);
  const [totalActiveCate, setTotalActiveCate] = useState<number>(0);
  const navigate = useNavigate();

  const handleOpenDialog = (catechist: CatechistItemResponse) => {
    setSelectedCatechist(catechist); // Lưu id của catechist
    setDialogOpen(true); // Mở dialog
  };

  const handleCloseDialog = () => {
    setDialogOpen(false); // Đóng dialog
    setSelectedCatechist(null); // Reset selectedCatechist
  };

  const [openViewLeaveRequest, setOpenViewLeaveRequest] =
    useState<boolean>(false);

  const handleCloseViewLeaveRequest = () => setOpenViewLeaveRequest(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<
    GetLeaveRequestItemResponse | undefined
  >(undefined);

  const [dialogCatechistDetailOpen, setDialogCatechistDetailOpen] =
    useState(false);

  const columns: GridColDef[] = [
    {
      field: "no",
      headerName: "STT",
      width: 15,
      renderCell: (params) => {
        {
          const rowIndex = params.api.getRowIndexRelativeToVisibleRows(
            params.row.id
          );
          return rowIndex != null && rowIndex != undefined && rowIndex >= 0
            ? rowIndex + 1
            : 0;
        }
      },
    },
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 70,
      renderCell: (params) => (
        <img
          src={
            params.row.imageUrl && params.row.imageUrl != ""
              ? params.row.imageUrl
              : "https://via.placeholder.com/150"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    { field: "code", headerName: "Mã giáo lý viên", width: 115 },
    { field: "fullName", headerName: "Tên đầy đủ", width: 180 },
    {
      field: "christianName",
      headerName: "Tên Thánh",
      width: 120,
      renderCell: (params) =>
        params.row.christianName.replace("Thánh", "").trim() || "N/A", // Chỉnh sửa hiển thị tên thánh
    },
    { field: "gender", headerName: "Giới tính", width: 85 },
    {
      field: "dateOfBirth",
      headerName: "Ngày sinh",
      width: 110,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.value),
    },
    {
      field: "level.name",
      headerName: "Cấp bậc",
      width: 90,
      renderCell: (params) =>
        params.row.level ? params.row.level.name : "N/A",
    },
    {
      field: "email",
      headerName: "Email",
      width: 170,
      renderCell: (params) => params.row.email || "N/A", // Hiển thị email nếu có
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      width: 120,
      renderCell: (params) => formatPhone(params.value),
    },

    {
      field: "certificates.length",
      headerName: "Chứng chỉ",
      align: "center",
      width: 85,
      renderCell: (params) => {
        const { certificates } = params.row;
        return <span>{certificates.length}</span>;
      },
    },
    {
      field: "numberOfClass",
      headerName: "Lớp hiện tại",
      width: 100,
      renderCell: (params) => {
        return (
          <Button
            color="secondary"
            className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
            onClick={() => {
              handleViewClassCatechist(params.row);
            }}
          >
            Xem
          </Button>
        );
      },
    },
    {
      field: "isTeaching",
      headerName: "Trạng thái giảng dạy",
      width: 250,
      renderCell: (params) => {
        return params.value ? (
          <div className="flex gap-x-1">
            <div>
              <span className="bg-success text-white px-2 py-1 rounded-xl">
                Đang hoạt động
              </span>
            </div>
            <div>
              <Button
                color="primary"
                className="btn btn-primary"
                onClick={() => {
                  handleChangeIsTeaching(params.row);
                }}
              >
                Thay đổi
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-x-1">
              <div>
                <span className="bg-danger text-white px-2 py-1 rounded-xl">
                  Đã nghỉ
                </span>
              </div>
              <div>
                <Button
                  color="secondary"
                  onClick={() => {
                    const action = async () => {
                      try {
                        const firstRes = await leaveRequestApi.getLeaveRequests(
                          LeaveRequestStatus.Approved,
                          params.row.id
                        );
                        const leave = firstRes.data.data.sort((a, b) => {
                          if (a.leaveDate && b.leaveDate) {
                            return (
                              new Date(b.leaveDate).getTime() -
                              new Date(a.leaveDate).getTime()
                            );
                          }
                          return -1;
                        })[0];
                        if (leave) {
                          setSelectedLeaveRequest(leave);
                          setOpenViewLeaveRequest(true);
                        }
                      } catch (err) {
                        console.error(err);
                        sweetAlert.alertFailed(
                          "Có lỗi khi tải đơn nghỉ dạy",
                          "",
                          3000,
                          28
                        );
                      }
                    };
                    action();
                  }}
                >
                  Xem phê duyệt
                </Button>
              </div>
            </div>
          </>
        );
      },
    },
  ];

  const handleUpdateCatechist = () => {
    const catechist = rows.find((item) => item.id == selectedIds[0].toString());
    if (catechist) {
      setSelectedUpdateCatechist(catechist);
      setUpdateMode(true);
      setOpenDialog(true);
    }
  };

  useEffect(() => {
    if (!openDialog) {
      setUpdateMode(false);
      setSelectedUpdateCatechist(null);
    }
  }, [openDialog]);

  const handleAddCatechist = () => {
    setOpenDialog(true);
  };

  // Hàm fetch các catechist
  const fetchCatechists = async () => {
    try {
      setLoading(true);

      const firstRes = await catechistApi.getAllCatechists();
      const { data } = await catechistApi.getAllCatechists(
        1,
        firstRes.data.data.total
      );

      setTotalCate(firstRes.data.data.total);
      let finalData = data.data.items.filter(
        (item) => item.isTeaching == statusIsTeaching.value
      );

      if (statusIsTeaching.value) {
        setTotalActiveCate(finalData.length);
      } else {
        setTotalActiveCate(firstRes.data.data.total - finalData.length);
      }

      setRows(finalData);
      setRowCount(finalData.length);
    } catch (error) {
      console.error("Lỗi khi tải danh sách catechists:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi tải danh sách!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCatechists = async () => {
    try {
      enableLoading();
      const { data } = await timetableApi.exportCatechistData();

      // Tạo Blob từ response và sử dụng FileSaver để tải xuống file
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileSaver.saveAs(blob, "Danh_sach_giao_ly_vien.xlsx");
    } catch (error) {
      console.error("Lỗi khi xuất danh sách giáo lý viên:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi xuất danh sách!", "", 1000, 22);
    } finally {
      disableLoading();
    }
  };

  useEffect(() => {
    fetchCatechists();
    storeCurrentPath(PATH_ADMIN.admin_catechist_management);
  }, [statusIsTeaching]);

  const handleChangeIsTeaching = async (catechist: CatechistItemResponse) => {
    try {
      enableLoading();

      const remainingClassHavingSlots =
        await catechistInClassApi.getClassesRemainingSlotsOfCatechist(
          catechist.id
        );

      if (remainingClassHavingSlots.data.data.length > 0) {
        disableLoading();
        const confirm = await sweetAlert.confirm(
          `Không thể thay đổi trạng thái giảng dạy`,
          `Giáo lý viên ${catechist.fullName} hiện vẫn còn tiết học ở
           lớp học sau:\n
          ${remainingClassHavingSlots.data.data.map((item) => `${item.name} (Niên khóa ${formatDate.YYYY(item.startDate)}-${formatDate.YYYY(item.endDate)})`).join(", ")}`,
          "Xem lớp học",
          "Hủy bỏ"
        );
        if (confirm) {
          let selectClassIds: string[] = [];
          remainingClassHavingSlots.data.data.forEach((item) => {
            selectClassIds.push(item.id);
          });
          navigate(`${PATH_ADMIN.admin_class_management}`, {
            state: {
              classIds: selectClassIds,
            },
          });
        }
        return;
      }
      handleOpenDialog(catechist);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi thay đổi trạng thái!",
        "",
        1000,
        22
      );
    } finally {
      disableLoading();
    }
  };

  const handleViewClassCatechist = async (catechist: CatechistItemResponse) => {
    try {
      enableLoading();

      const remainingClassHavingSlots =
        await catechistInClassApi.getClassesRemainingSlotsOfCatechist(
          catechist.id
        );

      if (remainingClassHavingSlots.data.data.length > 0) {
        disableLoading();
        const confirm = await sweetAlert.confirm(
          ``,
          `Giáo lý viên ${catechist.fullName} hiện đang dạy ở
           lớp học sau:\n
          ${remainingClassHavingSlots.data.data.map((item) => `${item.name} (Niên khóa ${formatDate.YYYY(item.startDate)}-${formatDate.YYYY(item.endDate)})`).join(", ")}`,
          "Xem",
          "Đóng",
          "info"
        );
        if (confirm) {
          let selectClassIds: string[] = [];
          remainingClassHavingSlots.data.data.forEach((item) => {
            selectClassIds.push(item.id);
          });
          navigate(`${PATH_ADMIN.admin_class_management}`, {
            state: {
              classIds: selectClassIds,
            },
          });
        }
        return;
      } else {
        disableLoading();
        sweetAlert.alertInfo(
          ``,
          `Giáo lý viên ${catechist.fullName} hiện đang không có tiết học ở
           lớp nào`,
          10000,
          45
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi tải!", "", 1000, 22);
    } finally {
      disableLoading();
    }
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
        Danh sách giáo lý viên
      </h1>
      {/* Thêm nút Refresh ở đây */}
      <div className="my-2 flex justify-between mx-3">
        <div className="min-w-[10px] gap-x-10 flex">
          <div className="z-999">
            <label htmlFor="" className="ml-2">
              Trạng thái giảng dạy
            </label>
            <Select
              options={[
                { value: true, label: "Đang hoạt động" },
                { value: false, label: "Đã nghỉ" },
              ]}
              value={statusIsTeaching}
              onChange={(newValue: any) =>
                setStatusIsTeaching(
                  newValue as { value: string; label: string }[]
                )
              }
              placeholder="Chọn trạng thái giảng dạy"
              className={`mt-1 w-[200px]`}
            />
          </div>
          <div>
            <p>Tổng số lượng giáo lý viên: {totalCate}</p>{" "}
            <p>Tổng số lượng giáo lý viên hoạt động: {totalActiveCate}</p>
            <p>
              Tổng số lượng giáo lý viên đã nghỉ: {totalCate - totalActiveCate}
            </p>
          </div>
        </div>
        <div className="flex gap-x-2">
          {selectedIds.length === 1 ? (
            <>
              <div>
                <Button
                  onClick={() => {
                    setDialogCatechistDetailOpen(true);
                  }} // Open dialog
                  variant="outlined"
                  color="secondary"
                  className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
                  style={{ marginBottom: "16px" }}
                >
                  Xem chi tiết
                </Button>
              </div>
              <div>
                <Button
                  className="btn btn-primary"
                  onClick={() => {
                    handleUpdateCatechist();
                  }} // Open dialog
                  variant="outlined"
                  color="primary"
                  style={{ marginBottom: "16px" }}
                >
                  Cập nhật
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}
          <div>
            <Button
              className="btn btn-success"
              onClick={handleAddCatechist} // Open dialog
              variant="outlined"
              color="success"
              style={{ marginBottom: "16px" }}
            >
              Thêm mới
            </Button>
          </div>
          <div>
            <Button
              onClick={handleExportCatechists} // Xuất danh sách
              variant="contained"
              color="primary"
              style={{ marginBottom: "16px" }}
            >
              Xuất danh sách
            </Button>
          </div>
          <div>
            <Button
              onClick={() => fetchCatechists()} // Gọi lại hàm fetchCatechists
              variant="contained"
              color="primary"
              style={{ marginBottom: "16px" }}
            >
              Tải lại
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full px-2">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="client"
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[50, 100, 250]}
          rowSelectionModel={selectedIds}
          sx={{
            height: 480,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          localeText={viVNGridTranslation}
          onRowSelectionModelChange={(newSelection) => {
            setSelectedIds(newSelection);
          }}
          checkboxSelection
          disableRowSelectionOnClick
          disableMultipleRowSelection
        />
      </div>
      {openDialog && (
        <CatechistDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          refresh={fetchCatechists}
          updateMode={updateMode}
          updatedCatechist={selectedUpdateCatechist}
        />
      )}
      {selectedCatechist && (
        <CatechistLeaveRequestDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          catechistId={selectedCatechist.id}
          refreshCatechists={fetchCatechists} // Cập nhật lại danh sách catechists sau khi phê duyệt
        />
      )}
      {openViewLeaveRequest ? (
        <>
          <LeaveRequestDialog
            open={openViewLeaveRequest}
            onClose={handleCloseViewLeaveRequest}
            leaveRequest={selectedLeaveRequest}
          />
        </>
      ) : (
        <></>
      )}
      {dialogCatechistDetailOpen ? (
        <>
          <CatechistDetailDialog
            catechistId={selectedIds[0].toString()}
            open={dialogCatechistDetailOpen}
            onClose={() => {
              setDialogCatechistDetailOpen(false);
            }}
          />
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
}
