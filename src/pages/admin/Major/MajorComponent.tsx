import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button, Dialog } from "@mui/material";
import { useState, useEffect } from "react";
import majorApi from "../../../api/Major"; // Import API Major
import gradeApi from "../../../api/Grade";
import { MajorResponse } from "../../../model/Response/Major";
import viVNGridTranslation from "../../../locale/MUITable";
import sweetAlert from "../../../utils/sweetAlert";
import { useNavigate } from "react-router-dom"; // Import useNavigate từ react-router-dom
import { PATH_ADMIN } from "../../../routes/paths";
import AddLevelDialog from "./AddLevelDialog";
import { storeCurrentPath } from "../../../utils/utils";

export default function MajorComponent() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MajorResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // zero-based index for MUI DataGrid
    pageSize: 10, // Default page size
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [majorName, setMajorName] = useState<string>("");
  const [majorLevel, setMajorLevel] = useState<number | null>(null);

  // Define columns for Major
  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên ngành", width: 170 },
    { field: "hierarchyLevel", headerName: "Cấp độ ngành", width: 170 },
    {
      field: "gradeCount",
      headerName: "Số lượng khối",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-start">
          <p>{params.row.gradeCount}</p>
          <div className="ml-2">
            <Button
              variant="contained"
              color="info"
              onClick={() => handleViewGrades(params.row.id)}
            >
              Xem
            </Button>
          </div>
        </div>
      ),
    },
    {
      field: "levels",
      headerName: "Cấp độ giáo lý viên phù hợp",
      width: 830,
      renderCell: (params) => (
        <div>
          <p>{params.row.levels}</p>
        </div>
      ),
    },
  ];

  const fetchLevelsByMajor = async (majorId: string) => {
    try {
      const { data } = await majorApi.getLevelsOfMajor(majorId);
      let sortedArr = data.data.items.sort((a: any, b: any) => {
        return a.hierarchyLevel - b.hierarchyLevel;
      });
      return sortedArr
        .map(
          (level: any) =>
            `${level.name} (${level.description} - Phân cấp: ${level.hierarchyLevel})`
        )
        .join(", "); // Trả về danh sách tên level nối bởi dấu phẩy
    } catch (error) {
      console.error("Error loading levels for major:", error);
      return "N/A"; // Trả về "N/A" nếu lỗi xảy ra
    }
  };

  // Handle xem khối
  const handleViewGrades = (majorId: string) => {
    if (!majorId || majorId == "") {
      sweetAlert.alertFailed(
        "Vui lòng chọn một ngành để xem khối!",
        "",
        1000,
        22
      );
      return;
    }
    if (majorId) {
      // Điều hướng tới trang Grade với majorId và pastoralYearId
      navigate(`${PATH_ADMIN.admin_grade_management}`, {
        state: {
          majorId: majorId,
        },
      });
    }
  };

  // Fetch list of Majors
  const fetchMajors = async () => {
    try {
      setLoading(true);

      const firstRes = await majorApi.getAllMajors();
      const { data } = await majorApi.getAllMajors(1, firstRes.data.data.total);

      const sortedArray = data.data.items.sort(
        (a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel
      );

      const updatedRows = await Promise.all(
        sortedArray.map(async (major: MajorResponse) => {
          const gradeCount = await fetchGradeCountByMajor(major.id);
          const levels = await fetchLevelsByMajor(major.id); // Gọi API để lấy danh sách level
          return {
            ...major,
            gradeCount,
            levels, // Gán danh sách level vào row
          };
        })
      );

      setRows(updatedRows);
      setRowCount(data.data.total);
    } catch (error) {
      console.error("Error loading majors:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi tải danh sách!", "", 1000, 22);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeCountByMajor = async (majorId: string) => {
    try {
      const { data } = await gradeApi.getAllGrades(majorId); // Gọi API lấy danh sách khối
      return data.data.items.length; // Trả về số lượng khối
    } catch (error) {
      console.error("Error loading grades:", error);
      return "N/A"; // Trả về "N/A" nếu có lỗi
    }
  };

  useEffect(() => {
    fetchMajors(); // Lấy danh sách các major
    storeCurrentPath(PATH_ADMIN.admin_major_management);
  }, [paginationModel]); // Gọi lại khi thay đổi pastoralYear

  // Open Dialog to create Major
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Handle creating Major
  const handleCreateMajor = async () => {
    if (majorName == "") {
      sweetAlert.alertWarning("Vui lòng nhập tên ngành", "", 3000, 23);
      return;
    } else if (
      majorName &&
      rows.find(
        (item) =>
          item.name.trim().toLowerCase() == majorName.trim().toLowerCase()
      )
    ) {
      sweetAlert.alertWarning("Tên ngành này đã tồn tại", "", 3000, 23);
      return;
    }

    if (!majorLevel || majorLevel <= 0) {
      sweetAlert.alertWarning("Vui lòng nhập cấp độ lớn hơn 0", "", 3000, 26);
      return;
    } else if (
      majorLevel &&
      rows.find((item) => item.hierarchyLevel == majorLevel)
    ) {
      sweetAlert.alertWarning("Cấp độ ngành này đã tồn tại", "", 3000, 25);
      return;
    }

    try {
      await majorApi.createMajor({
        name: majorName,
        hierarchyLevel: majorLevel ?? 0,
      });
      sweetAlert.alertSuccess("Tạo ngành thành công!", "", 2500, 24);
      fetchMajors();
      setOpenDialog(false);
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes("Không thể cập nhật khi bắt đầu niên khóa mới")
      ) {
        sweetAlert.alertFailed(
          "Không thể cập nhật khi bắt đầu niên khóa mới",
          "",
          5000,
          25
        );
      } else {
        sweetAlert.alertFailed("Có lỗi xảy ra khi tạo ngành", "", 2500, 25);
      }
    }
  };

  // Handle selection change in DataGrid
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRows(newSelectionModel);
  };

  // Refresh button handler
  const handleRefresh = () => {
    fetchMajors();
  };

  const handleDeleteMajor = async () => {
    try {
      const selectedRow: any = rows.find(
        (row) => row.id === selectedRows[0].toString()
      );

      const confirm = await sweetAlert.confirm(
        `
      Xác nhận xóa ngành ${selectedRow.name}`,
        "",
        undefined,
        undefined,
        "question"
      );

      if (!confirm) {
        return;
      }
      if (!selectedRow) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa ngành",
          "Không tìm thấy ngành này để xóa",
          10000,
          22
        );
        return;
      }

      if (selectedRow.gradeCount >= 1) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa ngành",
          "Không thể xóa ngành này vì có dữ liệu bên trong ngành",
          10000,
          25
        );
        return;
      }

      await majorApi.deleteMajor(selectedRows[0].toString());
      sweetAlert.alertSuccess("Xoá thành công", "", 1000, 18);
    } catch (error: any) {
      console.log("error", error);

      if (
        error.message &&
        error.message.includes("Không thể cập nhật khi bắt đầu niên khóa mới")
      ) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa ngành",
          "Không thể cập nhật khi bắt đầu niên khóa mới",
          5000,
          25
        );
      } else if (
        error.message &&
        error.message.includes("Không thể xóa dữ liệu đang được sử dụng")
      ) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa ngành",
          "Không thể xóa ngành này vì có dữ liệu bên trong ngành",
          5000,
          25
        );
      } else {
        sweetAlert.alertFailed("Có lỗi xảy ra khi xóa", "", 1000, 20);
      }
    } finally {
      handleRefresh();
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Danh sách ngành
      </h1>

      <div className="my-2 flex justify-between mx-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center"></div>
          <div className="flex gap-x-[5px]">
            {selectedRows.length == 1 ? (
              <>
                <Button
                  onClick={() => {
                    const selected = rows.find(
                      (row) => row.id === selectedRows[0]?.toString()
                    );
                    setSelectedRow(selected);
                    setIsDialogOpen(true);
                  }}
                  variant="outlined"
                  color="success"
                  className="btn btn-success"
                  style={{ marginBottom: "16px" }}
                >
                  Thêm cấp bậc
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteMajor();
                  }}
                  variant="outlined"
                  color="error"
                  className="btn btn-danger"
                  style={{ marginBottom: "16px" }}
                >
                  Xóa Ngành
                </Button>
              </>
            ) : (
              <></>
            )}

            <Button
              onClick={handleOpenDialog}
              variant="outlined"
              color="primary"
              className="btn btn-primary"
              style={{ marginBottom: "16px" }}
            >
              Thêm Ngành
            </Button>

            <Button
              onClick={handleRefresh}
              variant="contained"
              color="primary"
              style={{ marginBottom: "16px" }}
            >
              Tải lại
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-3">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="client"
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          pageSizeOptions={[10, 25, 50, 100, 250]}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
          rowSelectionModel={selectedRows} // Use selectedRows as controlled model
          localeText={viVNGridTranslation}
          disableMultipleRowSelection
          sx={{
            maxHeight: 480,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
        />
      </div>

      {/* Dialog for creating new Major */}
      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <div style={{ padding: "20px" }}>
          <label htmlFor="" className="ml-2 text-[1rem] text-gray-400">
            Tên ngành <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="nameMajor"
            value={majorName}
            onChange={(e) => setMajorName(e.target.value)}
            className="block w-full p-2 border border-gray-800 rounded-sm"
            placeholder="Nhập tên ngành"
          />

          <label htmlFor="" className="ml-2 text-[1rem] text-gray-400 mt-4">
            Cấp độ ngành <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="levelMajor"
            value={majorLevel ?? 0}
            onChange={(e) => {
              setMajorLevel(parseInt(e.target.value, 10));
            }}
            className="block w-full p-2 border border-gray-800 rounded-sm"
            min="0"
            placeholder="Cấp độ ngành"
          />
          <div className="w-full flex justify-between mt-4">
            <div>
              <Button
                onClick={() => {
                  setOpenDialog(false);
                }}
                variant="outlined"
                color="primary"
              >
                Hủy bỏ
              </Button>
            </div>
            <div>
              <Button
                onClick={handleCreateMajor}
                variant="contained"
                color="primary"
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {selectedRow && (
        <AddLevelDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          selectedRow={selectedRow}
          refreshData={handleRefresh}
        />
      )}
    </Paper>
  );
}
