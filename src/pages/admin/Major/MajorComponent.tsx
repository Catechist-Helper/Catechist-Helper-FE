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
      navigate(`${PATH_ADMIN.grade_management}`, {
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
  }, [paginationModel]); // Gọi lại khi thay đổi pastoralYear

  // Open Dialog to create Major
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  console.log("aa", rows);

  // Handle creating Major
  const handleCreateMajor = async () => {
    try {
      await majorApi.createMajor({
        name: majorName,
        hierarchyLevel: majorLevel ?? 0,
      });
      sweetAlert.alertSuccess("Tạo ngành thành công!", "", 5000, 25);
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
        sweetAlert.alertFailed("Có lỗi xảy ra khi tạo ngành", "", 5000, 25);
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

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Danh sách ngành
      </h1>

      <div className="my-2 flex justify-between mx-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center"></div>
          <div className="flex gap-x-[5px]">
            {selectedRows.length == 1 ? (
              <Button
                onClick={() => {
                  handleDeleteMajor();
                }}
                variant="contained"
                color="error"
                style={{ marginBottom: "16px" }}
              >
                Xóa Ngành
              </Button>
            ) : (
              <></>
            )}

            <Button
              onClick={handleOpenDialog}
              variant="contained"
              color="primary"
              style={{ marginBottom: "16px" }}
            >
              Thêm Ngành
            </Button>

            <Button
              onClick={handleRefresh}
              variant="contained"
              color="secondary"
              style={{ marginBottom: "16px" }}
            >
              Tải lại
            </Button>
          </div>
        </div>
      </div>

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
        sx={{
          border: 0,
        }}
        localeText={viVNGridTranslation}
        disableMultipleRowSelection
      />

      {/* Dialog for creating new Major */}
      <Dialog
        open={openDialog}
        // onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <div style={{ padding: "20px" }}>
          <input
            type="text"
            name="nameMajor"
            value={majorName}
            onChange={(e) => setMajorName(e.target.value)}
            className="block w-full p-2 border border-gray-800 rounded-sm"
            placeholder="Tên ngành"
          />
          <input
            type="number"
            name="levelMajor"
            value={majorLevel ?? 0}
            onChange={(e) => {
              setMajorLevel(parseInt(e.target.value, 10));
            }}
            className="block w-full p-2 border border-gray-800 rounded-sm my-3"
            min="0"
            placeholder="Cấp độ ngành"
          />
          <div className="w-full flex justify-between">
            <div>
              <Button
                onClick={handleCreateMajor}
                variant="contained"
                color="primary"
              >
                Lưu
              </Button>
            </div>
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
          </div>
        </div>
      </Dialog>
    </Paper>
  );
}
