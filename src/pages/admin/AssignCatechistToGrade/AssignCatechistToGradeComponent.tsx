import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Select from "react-select";
import { Button } from "@mui/material";
import majorApi from "../../../api/Major";
import gradeApi from "../../../api/Grade";
import sweetAlert from "../../../utils/sweetAlert";
import { CreateCatechistInGradeRequest } from "../../../model/Request/CatechistInGrade";
import viVNGridTranslation from "../../../locale/MUITable";
import catechistInGradeApi from "../../../api/CatechistInGrade";
import { LevelResponse } from "../../../model/Response/Major";
import useAppContext from "../../../hooks/useAppContext";

export default function AssignCatechistToGradeComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enableLoading, disableLoading } = useAppContext();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  // const [upadteMode, setUpadteMode] = useState<boolean>(false);
  const [catechists, setCatechists] = useState<any[]>([]); // Bảng catechist chưa được assign
  const [assignedCatechists, setAssignedCatechists] = useState<any[]>([]); // Bảng catechist đã được assign
  const [overLevelCatechists, setOverLevelCatechists] = useState<any[]>([]);
  const [selectedOverLevelCatechists, setSelectedOverLevelCatechists] =
    useState<GridRowSelectionModel>([]);
  const [suitableGradesToMove, setSuitableGradesToMove] = useState<any[]>([]);

  // const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  // const [totalCatechist, setTotalCatechist] = useState<number>(0);
  const [selectedGradeToMove, setSelectedGradeToMove] = useState<any>(null);

  const [mainCatechistId, setMainCatechistId] = useState<string | null>(null); // ID của trưởng khối
  const [gradeName, setGradeName] = useState<string>("");
  const [majorName, setMajorName] = useState<string>("");
  const [levelOfGrade, setLevelOfGrade] = useState<LevelResponse[] | null>(
    null
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 4,
  });
  const [paginationModel2, setPaginationModel2] = useState<GridPaginationModel>(
    {
      page: 0,
      pageSize: 4,
    }
  );
  const [paginationModel3, setPaginationModel3] = useState<GridPaginationModel>(
    {
      page: 0,
      pageSize: 10,
    }
  );
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [selectedRows1, setSelectedRows1] = useState<GridRowSelectionModel>([]);
  const [selectedRows2, setSelectedRows2] = useState<GridRowSelectionModel>([]);
  const handleSelectionChange1 = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRows1(newSelectionModel);
  };
  const handleSelectionChange2 = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRows2(newSelectionModel);
  };

  // Thông tin grade từ location.state
  useEffect(() => {
    const { majorId, gradeId, gradeName, majorName, totalCatechist, viewMode } =
      location.state;
    // setSelectedMajor(majorId);
    setSelectedGrade(gradeId);
    setGradeName(gradeName);
    setMajorName(majorName);
    setViewMode(viewMode ? true : false);
    if (totalCatechist) {
    }
    // setTotalCatechist(totalCatechist);

    if (!levelOfGrade) {
      fetchLevels(majorId);
    }
    if (levelOfGrade) {
      fetchCatechists(majorId); // Lấy danh sách catechists chưa được assign
      fetchAssignedCatechists(gradeId); // Lấy danh sách catechists đã được assign
    }
  }, [levelOfGrade]);

  const fetchCatechists = async (majorId: string) => {
    try {
      const { data } = await majorApi.getCatechistsOfMajor(
        majorId,
        true,
        1,
        10000
      );
      // Lọc bỏ catechists đã được assign
      const unassignedCatechists = data.data.items.filter(
        (catechist) =>
          !assignedCatechists.some((assigned) => assigned.id === catechist.id)
      );
      setCatechists(unassignedCatechists);
    } catch (error) {
      console.error("Error loading catechists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedCatechists = async (gradeId: string) => {
    try {
      // API để lấy danh sách catechist đã được assign ở grade
      const { data } = await gradeApi.getCatechistsOfGrade(gradeId);
      const fetchItems: any[] = [];
      [...data.data.items].forEach((item) => {
        fetchItems.push({ ...item, ...item.catechist });
      });

      setAssignedCatechists(
        [...fetchItems].filter(
          (item: any) =>
            levelOfGrade &&
            levelOfGrade.find((level) => item.catechist.level.id == level.id)
        )
      );
      setOverLevelCatechists(
        [...fetchItems].filter(
          (item: any) =>
            !(
              levelOfGrade &&
              levelOfGrade.find((level) => item.catechist.level.id == level.id)
            )
        )
      );
      const main = data.data.items.find((item: any) => item.isMain);
      if (main) {
        setMainCatechistId(main.catechist.id);
      }
    } catch (error) {
      console.error("Error loading assigned catechists:", error);
    }
  };

  const fetchLevels = async (majorId: string) => {
    try {
      const { data } = await majorApi.getLevelsOfMajor(majorId, 1, 100);
      setLevelOfGrade(
        data.data.items.sort((a, b) => {
          return a.hierarchyLevel - b.hierarchyLevel;
        })
      );
    } catch (error) {
      console.error("Error loading catechists:", error);
    }
  };

  const handleAddCatechist = (selectedIds: string[]) => {
    const selectedCatechists = catechists.filter((catechist) =>
      selectedIds.includes(catechist.id)
    );
    const addItems: any[] = [];
    selectedCatechists.forEach((item) => {
      addItems.push({ catechist: item, id: item.id, ...item });
    });
    setAssignedCatechists([...assignedCatechists, ...addItems]);
    setCatechists(
      catechists.filter((catechist) => !selectedIds.includes(catechist.id))
    ); // Xóa khỏi bảng chưa assign
  };

  const handleRemoveCatechist = (selectedIds: string[]) => {
    const removedCatechists = assignedCatechists.filter(
      (catechist) => !selectedIds.includes(catechist.catechist.id)
    );
    const removedItems: any[] = [];
    assignedCatechists
      .filter((catechist) => selectedIds.includes(catechist.catechist.id))
      .forEach((item) => {
        removedItems.push(item.catechist);
      });
    setAssignedCatechists(removedCatechists);
    setCatechists([...catechists, ...removedItems]); // Đưa lại vào bảng chưa assign
  };

  const handleMainCatechistChange = (id: string) => {
    setMainCatechistId(id);
  };

  useEffect(() => {
    if (mainCatechistId) {
      setAssignedCatechists((prevAssignedCatechists) => {
        // Tìm object có id == MainCatechistId
        const mainCatechist = prevAssignedCatechists.find(
          (catechist) => catechist.id === mainCatechistId
        );

        // Nếu tìm thấy, đưa lên đầu
        if (mainCatechist) {
          const updatedCatechists = prevAssignedCatechists.filter(
            (catechist) => catechist.id !== mainCatechistId
          );
          return [mainCatechist, ...updatedCatechists];
        }

        // Nếu không tìm thấy, trả về mảng ban đầu
        return prevAssignedCatechists;
      });
    }
  }, [mainCatechistId]);

  const handleConfirm = async () => {
    if (!mainCatechistId) {
      sweetAlert.alertFailed(
        "Vui lòng chọn một giáo lý viên làm trưởng khối!",
        "",
        1000,
        22
      );
      return;
    }

    const requestData: CreateCatechistInGradeRequest = {
      gradeId: selectedGrade,
      catechistIds: [...assignedCatechists, ...overLevelCatechists].map(
        (catechist) => catechist.catechist.id
      ),
      mainCatechistId: mainCatechistId,
    };

    try {
      await catechistInGradeApi.createCatechistInGrade(requestData);
      sweetAlert.alertSuccess("Gán giáo lý viên thành công!", "", 1000, 22);
      navigate(-1);
    } catch (error) {
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi gán giáo lý viên!",
        "",
        1000,
        22
      );
    }
  };

  useEffect(() => {
    if (overLevelCatechists.length >= 0) {
      const action = async () => {
        let levelIds: string[] = [];
        overLevelCatechists.forEach((item: any) => {
          if (
            levelIds.findIndex((level) => level == item.catechist.level.id) < 0
          ) {
            levelIds.push(item.catechist.level.id);
          }
        });

        const res = await majorApi.getAllMajors();
        res.data.data.items.forEach((major) => {
          const action2 = async () => {
            const res2 = await majorApi.getLevelsOfMajor(major.id);
            if (
              res2.data.data.items.findIndex(
                (item2) => levelIds.findIndex((item3) => item3 == item2.id) >= 0
              ) >= 0
            ) {
              const action3 = async () => {
                const res3 = await gradeApi.getAllGrades(major.id);
                res3.data.data.items.forEach((item) => {
                  if (
                    suitableGradesToMove.findIndex(
                      (item4) => item4.id == item.id
                    ) < 0
                  ) {
                    setSuitableGradesToMove((prev) => [...prev, item]);
                  }
                });
              };
              action3();
            }
          };
          action2();
        });
      };
      action();
    }
    if (overLevelCatechists.length <= 0) {
      setSuitableGradesToMove([]);
    }
  }, [overLevelCatechists]);

  // Columns cho DataGrid
  const columns1: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={
            params.row.imageUrl ||
            "https://firebasestorage.googleapis.com/v0/b/catechisthelper-1f8af.appspot.com/o/defaultAvatar%2FDefaultAvatar.png?alt=media&token=e117852a-f40f-47d8-9801-b802e438de96"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    { field: "code", headerName: "Mã giáo lý viên", width: 150 },

    {
      field: "christianName",
      headerName: "Tên Thánh",
      width: 200,
    },
    { field: "fullName", headerName: "Tên giáo lý viên", width: 200 },
    { field: "gender", headerName: "Giới tính", width: 100 },
    {
      field: "catechist.level.name",
      headerName: "Cấp bậc",
      width: 150,
      renderCell: (params) =>
        params.row.level ? params.row.level.name : "N/A",
    },
  ];

  const columns2: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={
            params.row.catechist.imageUrl ||
            "https://firebasestorage.googleapis.com/v0/b/catechisthelper-1f8af.appspot.com/o/defaultAvatar%2FDefaultAvatar.png?alt=media&token=e117852a-f40f-47d8-9801-b802e438de96"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    {
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 150,
      renderCell: (params) => params.row.catechist.code,
    },
    {
      field: "christianName",
      headerName: "Tên Thánh",
      width: 200,
      renderCell: (params) => params.row.catechist.christianName,
    },
    {
      field: "fullName",
      headerName: "Tên giáo lý viên",
      width: 200,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 100,
      renderCell: (params) => params.row.catechist.gender,
    },
    {
      field: "catechist.level.name",
      headerName: "Cấp bậc",
      width: 150,
      renderCell: (params) =>
        params.row.catechist.level ? params.row.catechist.level.name : "N/A",
    },
    {
      field: "main",
      headerName: "Trưởng khối",

      width: 120,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={mainCatechistId === params.row.catechist.id}
          onChange={() => {
            if (!viewMode) {
              handleMainCatechistChange(params.row.catechist.id);
            }
          }}
        />
      ),
    },
  ];

  if (!viewMode) {
    columns1.push({
      field: "assign",
      headerName: "Hành động",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="text"
          color="primary"
          className="btn btn-primary"
          onClick={() => handleAddCatechist([params.row.id])}
        >
          Thêm
        </Button>
      ),
    });

    columns2.push({
      field: "remove",
      headerName: "Hành động",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="text"
          color="error"
          className="btn btn-danger"
          onClick={() => handleRemoveCatechist([params.row.catechist.id])}
        >
          Xóa
        </Button>
      ),
    });
  }

  const columns3: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={
            params.row.catechist.imageUrl ||
            "https://firebasestorage.googleapis.com/v0/b/catechisthelper-1f8af.appspot.com/o/defaultAvatar%2FDefaultAvatar.png?alt=media&token=e117852a-f40f-47d8-9801-b802e438de96"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    {
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 150,
      renderCell: (params) => params.row.catechist.code,
    },
    {
      field: "christianName",
      headerName: "Tên Thánh",
      width: 200,
      renderCell: (params) => params.row.catechist.christianName,
    },
    {
      field: "fullName",
      headerName: "Tên giáo lý viên",
      width: 200,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 100,
      renderCell: (params) => params.row.catechist.gender,
    },
    {
      field: "catechist.level.name",
      headerName: "Cấp bậc",
      width: 150,
      renderCell: (params) =>
        params.row.catechist.level ? params.row.catechist.level.name : "N/A",
    },
  ];

  const handleMoveGradesForCatechists = async () => {
    try {
      enableLoading();
      if (!selectedGradeToMove) {
        sweetAlert.alertFailed(
          "Vui lòng chọn một khối để chuyển!",
          "",
          3000,
          28
        );
        disableLoading();
        return;
      }
      await catechistInGradeApi.replaceCatechistToAnotherGrade({
        gradeId: selectedGradeToMove.value,
        catechistIds: selectedOverLevelCatechists.map((item) => {
          return item.toString();
        }),
      });
      sweetAlert.alertSuccess("Chuyển khối thành công!", "", 3000, 24);
      const { majorId, gradeId } = location.state;

      fetchCatechists(majorId);
      fetchAssignedCatechists(gradeId);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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
        Giáo lý viên thuộc {gradeName}
      </h1>

      {/* Thông tin Grade */}
      <div className="mx-3 mt-2">
        <h3>
          <strong>Thông tin Khối: </strong> {gradeName}
        </h3>
        {/* Hiển thị thông tin major và pastoral year nếu cần */}
        <p>
          <strong>Ngành: </strong> {majorName}
        </p>
        <p>
          <strong>Cấp độ giáo lý viên phù hợp: </strong>{" "}
          {levelOfGrade
            ? levelOfGrade
                .map(
                  (level) =>
                    `${level.name} (${level.description} - Phân cấp: ${level.hierarchyLevel})`
                )
                .join(", ")
            : ""}
        </p>
        {/* <p
          className={`${assignedCatechists.length < totalCatechist ? "text-danger" : "text-success"}`}
        >
          <strong>Số lượng giáo lý viên cần thiết: {totalCatechist}</strong>
        </p> */}

        {overLevelCatechists.length <= 0 ? (
          <>
            {" "}
            {/* Bảng DataGrid chưa gán */}
            {!viewMode ? (
              <>
                <div className="mt-3 flex gap-x-14 items-end mb-3 w-full min-h-[38px]">
                  <h3>
                    <strong>Danh sách giáo lý viên chưa gán</strong>
                  </h3>
                  {selectedRows1.length > 0 ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const selectedIds = selectedRows1.map((item) =>
                            item.toString()
                          );
                          handleAddCatechist(selectedIds);
                          setSelectedRows1([]);
                        }}
                      >
                        Thêm
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
                <DataGrid
                  rows={catechists}
                  columns={columns1}
                  paginationMode="client"
                  rowCount={catechists.length}
                  loading={loading}
                  paginationModel={paginationModel}
                  pageSizeOptions={[4, 10, 25, 50, 100, 250]}
                  onPaginationModelChange={setPaginationModel}
                  checkboxSelection
                  sx={{
                    height: 250,
                    overflowX: "auto",
                    "& .MuiDataGrid-root": {
                      overflowX: "auto",
                    },
                  }}
                  localeText={viVNGridTranslation}
                  disableRowSelectionOnClick
                  onRowSelectionModelChange={handleSelectionChange1}
                  rowSelectionModel={selectedRows1}
                />
              </>
            ) : (
              <></>
            )}
            {/* Bảng DataGrid đã gán */}
            <div className="mt-3 flex gap-x-14 items-end mb-3 w-full min-h-[38px]">
              <h3>
                <strong>
                  {viewMode
                    ? "Danh sách giáo lý viên trong khối"
                    : "Danh sách giáo lý viên đã gán"}
                  <br />
                  <span className="inline-block mt-2">
                    Số lượng hiện tại: {assignedCatechists.length}
                  </span>
                </strong>
              </h3>
              {selectedRows2.length > 0 ? (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      const selectedIds = selectedRows2.map((item) =>
                        item.toString()
                      );
                      handleRemoveCatechist(selectedIds);
                      setSelectedRows2([]);
                    }}
                  >
                    Xóa
                  </Button>
                </>
              ) : (
                <></>
              )}
            </div>
            <DataGrid
              rows={assignedCatechists}
              columns={columns2}
              paginationMode="client"
              rowCount={assignedCatechists.length}
              loading={loading}
              paginationModel={paginationModel2}
              onPaginationModelChange={(newModel) =>
                setPaginationModel2(newModel)
              }
              pageSizeOptions={[4, 10, 25, 50, 100, 250]}
              checkboxSelection={!viewMode}
              localeText={viVNGridTranslation}
              disableRowSelectionOnClick
              sx={{
                height: viewMode ? 350 : 250,
                overflowX: "auto",
                "& .MuiDataGrid-root": {
                  overflowX: "auto",
                },
              }}
              onRowSelectionModelChange={handleSelectionChange2}
              rowSelectionModel={selectedRows2}
            />
          </>
        ) : (
          <>
            <h3 className="mt-3">
              <strong>
                <span className="text-danger">
                  Cần phải chuyển các giáo lý viên này sang khối khác trước khi
                  xếp giáo lý viên vào khối{" "}
                </span>
              </strong>
            </h3>
            <h3 className="mt-3 flex gap-x-5 items-center">
              <p>
                <strong>
                  <span className="text-purple-900">
                    Danh sách giáo lý viên cần chuyển khối
                  </span>
                </strong>
              </p>
              {selectedOverLevelCatechists.length > 0 ? (
                <>
                  <div>
                    <Select
                      options={suitableGradesToMove.map((item: any) => ({
                        value: item.id,
                        label: `${item.name} - Ngành: ${item.major.name}`,
                      }))}
                      value={selectedGradeToMove}
                      onChange={(newValue: any) =>
                        setSelectedGradeToMove(
                          newValue as { value: string; label: string }[]
                        )
                      }
                      placeholder="Chọn khối để chuyển..."
                      className="mt-1 min-w-[400px]"
                    />
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        handleMoveGradesForCatechists();
                      }}
                    >
                      Chuyển khối
                    </Button>
                  </div>
                </>
              ) : (
                <></>
              )}
            </h3>
            <DataGrid
              rows={overLevelCatechists}
              columns={columns3}
              paginationMode="client"
              rowCount={overLevelCatechists.length}
              loading={loading}
              paginationModel={paginationModel3}
              onPaginationModelChange={(newModel) =>
                setPaginationModel3(newModel)
              }
              pageSizeOptions={[10, 25, 50, 100, 250]}
              checkboxSelection
              localeText={viVNGridTranslation}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedOverLevelCatechists(newSelection);
              }}
              sx={{
                height: 350,
                overflowX: "auto",
                "& .MuiDataGrid-root": {
                  overflowX: "auto",
                },
              }}
            />
          </>
        )}

        <div className="flex justify-end mt-3 gap-x-2 mb-3 mx-3">
          {viewMode ? (
            <>
              {overLevelCatechists.length <= 0 ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setViewMode(false);
                    }}
                  >
                    Cập nhật
                  </Button>
                </>
              ) : (
                <></>
              )}

              <Button
                variant="outlined"
                color="primary"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Quay lại
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirm}
              >
                Xác nhận
              </Button>
              <Button
                variant="outlined"
                color="success"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Hủy bỏ
              </Button>
            </>
          )}
        </div>
      </div>
    </Paper>
  );
}
