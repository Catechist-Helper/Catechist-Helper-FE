import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Button,
  Dialog,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import majorApi from "../../../api/Major";
import gradeApi from "../../../api/Grade";
import { useLocation } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import { PATH_ADMIN } from "../../../routes/paths";
import { GradeResponse } from "../../../model/Response/Grade";
import useAppContext from "../../../hooks/useAppContext";
import { storeCurrentPath } from "../../../utils/utils";

export default function GradeComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [gradeName, setGradeName] = useState<string>("");

  const [majors, setMajors] = useState<any[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("all");
  const [selectedMajorCreateGrade, setSelectedMajorCreateGrade] =
    useState<string>("");
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    fetchMajors();
    storeCurrentPath(PATH_ADMIN.admin_grade_management);

    // Nếu có majorId và pastoralYearId từ location.state, set chúng làm giá trị mặc định
    if (location.state) {
      const { majorId } = location.state;
      setSelectedMajor(majorId);
      fetchGrades(majorId);
    } else {
      fetchGrades("");
    }
  }, [location.state]);

  // Fetch danh sách majors (ngành)
  const fetchMajors = async () => {
    try {
      const { data } = await majorApi.getAllMajors();

      const sortedArray = data.data.items.sort(
        (a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel
      );

      setMajors(sortedArray);
    } catch (error) {
      console.error("Error loading majors:", error);
    }
  };

  const fetchGrades = async (majorId?: string) => {
    try {
      setLoading(true);
      const page = paginationModel.page + 1;
      const size = paginationModel.pageSize;
      const { data } = await gradeApi.getAllGrades(
        majorId == "all" ? "" : majorId,
        page,
        size
      );

      const sortedArray = data.data.items.sort((a: any, b: any) => {
        // So sánh theo hierarchyLevel trước
        if (a.major.hierarchyLevel !== b.major.hierarchyLevel) {
          return a.major.hierarchyLevel - b.major.hierarchyLevel;
        }
        // Nếu hierarchyLevel bằng nhau, so sánh theo name
        return a.name.localeCompare(b.name);
      });

      const updatedRows = await Promise.all(
        sortedArray.map(async (grade: GradeResponse) => {
          const fetchCatechistRes = await fetchCatechistCountByGrade(grade.id);
          return {
            ...grade,
            catechistsCount:
              fetchCatechistRes && fetchCatechistRes.total
                ? fetchCatechistRes.total
                : 0,
            catechistItems:
              fetchCatechistRes && fetchCatechistRes.items
                ? fetchCatechistRes.items
                : null,
          };
        })
      );

      setRows(updatedRows);
      setRowCount(data.data.total);
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatechistCountByGrade = async (majorId: string) => {
    try {
      const { data } = await gradeApi.getCatechistsOfGrade(
        majorId,
        false,
        1,
        1000
      );
      return {
        total: data.data.total,
        items: data.data.items,
      }; // Trả về số lượng khối
    } catch (error) {
      console.error("Error loading grades:", error);
      return {};
    }
  };

  // Xử lý khi người dùng chọn Major
  const handleMajorChange = (event: any) => {
    setSelectedMajor(event.target.value);
    fetchGrades(event.target.value);
  };

  // Xử lý thêm mới Grade
  const handleCreateGrade = async () => {
    try {
      enableLoading();
      if (
        selectedMajorCreateGrade &&
        selectedMajorCreateGrade != "" &&
        gradeName &&
        gradeName != ""
      ) {
        await gradeApi.createGrade({
          name: gradeName,
          majorId: selectedMajorCreateGrade,
        });
        fetchGrades(selectedMajor);
        setOpenDialog(false);
        sweetAlert.alertSuccess("Tạo thành công!", "", 2500, 20);
      } else {
        sweetAlert.alertWarning(
          "Vui lòng điền đầy đủ thông tin!",
          "",
          2500,
          26
        );
      }
    } catch (error: any) {
      console.error(error);
      if (
        (error.message &&
          error.message.includes(
            "Không thể cập nhật khi bắt đầu niên khóa mới"
          )) ||
        (error.Error &&
          error.Error.includes("Không thể cập nhật khi bắt đầu niên khóa mới"))
      ) {
        sweetAlert.alertFailed(
          "Không thể cập nhật khi bắt đầu niên khóa mới",
          "",
          5000,
          25
        );
      } else {
        sweetAlert.alertFailed("Có lỗi xảy ra khi tạo khối!", "", 2500, 22);
      }
    } finally {
      disableLoading();
    }
  };

  // Define các cột cho DataGrid
  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên khối", width: 200 },
    {
      field: "major",
      headerName: "Ngành",
      width: 180,
      renderCell: (params) => {
        return params.row.major.name;
      },
    },
    {
      field: "hierarchyLevel",
      headerName: "Phân cấp ngành",
      width: 180,
      renderCell: (params) => {
        return params.row.major.hierarchyLevel;
      },
    },
    {
      field: "catechistsCount",
      headerName: "Số lượng giáo lý viên",
      align: "left",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="flex">
            <p>{params.row.catechistsCount}</p>
            <div className="ml-3">
              {params.row.catechistsCount <= 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddCatechist(params.row.id)}
                >
                  Thêm
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleUpdateCatechist(params.row.id)}
                  >
                    Xem
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      },
    },
    // {
    //   field: "viewClasses",
    //   headerName: "Xem Lớp",
    //   width: 120,
    //   renderCell: (params) => (
    //     <Button
    //       variant="contained"
    //       color="info"
    //       onClick={() => handleViewClasses(params.row.major.id, params.row.id)}
    //     >
    //       Xem
    //     </Button>
    //   ),
    // },
  ];

  // Handle thêm giáo lý viên cho khối
  const handleAddCatechist = (gradeId: string) => {
    const selectedGrade = rows.find((row) => row.id === gradeId);
    if (selectedGrade) {
      navigate(`${PATH_ADMIN.admin_assign_catechist_to_grade}`, {
        state: {
          majorId: selectedGrade.major.id,
          gradeId: selectedGrade.id,
          gradeName: selectedGrade.name,
          majorName: selectedGrade.major.name,
          totalCatechist: selectedGrade.totalCatechist,
        },
      });
    }
  };

  // Handle cập nhật giáo lý viên cho khối
  const handleUpdateCatechist = (gradeId: string) => {
    const selectedGrade = rows.find((row) => row.id === gradeId);
    if (selectedGrade) {
      navigate(`${PATH_ADMIN.admin_assign_catechist_to_grade}`, {
        state: {
          majorId: selectedGrade.major.id,
          gradeId: selectedGrade.id,
          gradeName: selectedGrade.name,
          majorName: selectedGrade.major.name,
          totalCatechist: selectedGrade.totalCatechist,
          viewMode: true,
        },
      });
    }
  };

  // Handle xem khối
  // const handleViewClasses = async (majorId: string, gradeId: string) => {
  //   if (!majorId || majorId == "" || !gradeId || gradeId == "") {
  //     sweetAlert.alertFailed(
  //       "Vui lòng chọn một khối để xem lớp!",
  //       "",
  //       1000,
  //       22
  //     );
  //     return;
  //   }
  //   if (majorId) {
  //     // Điều hướng tới trang Grade với majorId và pastoralYearId
  //     const { data } = await pastoralYearsApi.getAllPastoralYears();
  //     // Sắp xếp theo niên khóa gần nhất tới xa nhất
  //     const sortedPastoralYears = data.data.items.sort((a: any, b: any) => {
  //       const yearA = parseInt(a.name.split("-")[0]);
  //       const yearB = parseInt(b.name.split("-")[0]);
  //       return yearB - yearA;
  //     });
  //     navigate(`${PATH_ADMIN.admin_class_management}`, {
  //       state: {
  //         majorId: majorId,
  //         gradeId: gradeId,
  //         defaultYear:
  //           sortedPastoralYears && sortedPastoralYears[0]
  //             ? sortedPastoralYears[0].id
  //             : "",
  //       },
  //     });
  //   }
  // };

  // Handle selection change in DataGrid
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRows(newSelectionModel);
  };

  const handleDeleteGrade = async () => {
    try {
      const selectedRow: any = rows.find(
        (row) => row.id === selectedRows[0].toString()
      );
      const confirm = await sweetAlert.confirm(
        `
      Xác nhận xóa khối ${selectedRow.name}`,
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
          "Có lỗi khi xóa khối",
          "Không tìm thấy khối này để xóa",
          10000,
          22
        );
        return;
      }

      await gradeApi.deleteGrade(selectedRows[0].toString());
      sweetAlert.alertSuccess("Xoá thành công", "", 2500, 18);
      fetchGrades();
    } catch (error: any) {
      console.error("error", error);

      if (
        error.message &&
        error.message.includes("Không thể cập nhật khi bắt đầu niên khóa mới")
      ) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa khối",
          "Không thể cập nhật khi bắt đầu niên khóa mới",
          5000,
          25
        );
      } else if (
        error.message &&
        error.message.includes("Không thể xóa dữ liệu đang được sử dụng")
      ) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa khối",
          "Không thể xóa khối này vì có dữ liệu bên trong khối",
          5000,
          25
        );
      } else {
        sweetAlert.alertFailed("Có lỗi xảy ra khi xóa", "", 2500, 20);
      }
    } finally {
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        left: "3.8rem",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Danh sách khối
      </h1>

      <div className="my-2 flex justify-between mx-3">
        {/* Select cho Major */}
        <div className="flex mt-1">
          {/* Select cho Pastoral Year */}
          {/* <FormControl fullWidth sx={{ minWidth: 200, marginRight: 2 }}>
            <InputLabel>Chọn Niên Khóa</InputLabel>
            <Select
              value={selectedPastoralYear}
              onChange={handlePastoralYearChange}
            >
              {pastoralYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <FormControl
            fullWidth
            sx={{
              minWidth: 180,
              marginTop: 1.5,
              "& .MuiInputLabel-root": {
                transform: "translateY(-20px)",
                fontSize: "14px",
                marginLeft: "8px",
              },
              "& .MuiSelect-select": {
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            }}
          >
            <InputLabel>Chọn Ngành</InputLabel>
            <Select value={selectedMajor} onChange={handleMajorChange}>
              <MenuItem key="all" value="all">
                <em>Tất cả</em>
              </MenuItem>
              {majors.map((major) => (
                <MenuItem key={major.id} value={major.id}>
                  {major.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="flex">
          {selectedRows.length === 1 ? (
            <>
              <div>
                <Button
                  variant="outlined"
                  color="error"
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteGrade();
                  }}
                >
                  Xóa khối
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}
          {/* Nút Thêm Khối */}
          <div className="ml-1">
            <Button
              variant="outlined"
              color="primary"
              className="btn btn-primary"
              onClick={() => setOpenDialog(true)}
            >
              Thêm Khối
            </Button>
          </div>
          <div className="ml-1">
            <Button
              variant="contained"
              color="primary"
              onClick={() => fetchGrades(selectedMajor)}
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
        rowSelectionModel={selectedRows}
        sx={{
          maxHeight: 480,
          overflowX: "auto",
          "& .MuiDataGrid-root": {
            overflowX: "auto",
          },
        }}
        localeText={viVNGridTranslation}
        disableMultipleRowSelection
      />

      {/* Dialog for creating new Grade */}
      <Dialog open={openDialog} maxWidth="lg" fullWidth={true}>
        <div className="w-full" style={{ padding: "20px" }}>
          <h2>Tạo khối học mới</h2>
          <div className="my-2 mt-3">
            <FormControl
              fullWidth
              sx={{
                minWidth: 180,
                marginTop: 1.5,
                "& .MuiInputLabel-root": {
                  transform: "translateY(-20px)",
                  fontSize: "14px",
                  marginLeft: "8px",
                },
                "& .MuiSelect-select": {
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
              }}
            >
              <InputLabel>
                Chọn Ngành <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                value={selectedMajorCreateGrade}
                onChange={(event: any) => {
                  setSelectedMajorCreateGrade(event.target.value);
                }}
              >
                {majors.map((major) => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="my-2 mt-3">
            <TextField
              label={
                <span>
                  Tên khối <span style={{ color: "red" }}>*</span>
                </span>
              }
              value={gradeName}
              onChange={(e) => setGradeName(e.target.value)}
              fullWidth
            />
          </div>
          <div className="w-full flex mt-3 gap-x-2">
            <Button
              onClick={handleCreateGrade}
              variant="contained"
              color="primary"
            >
              Xác nhận
            </Button>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              color="primary"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Dialog>
    </Paper>
  );
}
