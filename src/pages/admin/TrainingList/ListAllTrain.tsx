import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import trainApi from "../../../api/TrainingList";
import levelApi from "../../../api/Level";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import {
  trainingListStatus,
  trainingListStatusLabel,
} from "../../../enums/TrainingList";
import useAppContext from "../../../hooks/useAppContext";
import { storeCurrentPath } from "../../../utils/utils";
import { PATH_ADMIN } from "../../../routes/paths";

const ListAllTrain: React.FC = () => {
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [init, setInit] = useState<boolean>(false);

  const [catechists, setCatechists] = useState<{ [key: string]: any[] }>({});
  const [levelMap, setLevelMap] = useState<{ [key: string]: string }>({});
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);

  const navigate = useNavigate();
  const { enableLoading, disableLoading } = useAppContext();
  const fetchLevels = async () => {
    try {
      const res: AxiosResponse = await levelApi.getAllLevel();
      const levels = res.data.data.items || [];
      const map: { [key: string]: string } = {};
      levels.forEach((level: any) => {
        map[level.id] = level.name;
      });
      setLevelMap(map);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cấp độ:", err);
    } finally {
      setInit(true);
    }
  };

  const fetchTrains = async () => {
    try {
      enableLoading();
      const res: AxiosResponse = await trainApi.getAllTrain();
      const data: BasicResponse = res.data;
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items
      ) {
        setTrains(data.data.items);
        data.data.items.forEach((train: any) => {
          trainApi
            .getCatechistsByTrainingListId(train.id)
            .then((res: AxiosResponse) => {
              setCatechists((prev) => ({
                ...prev,
                [train.id]: res.data.data.items || [],
              }));
            })
            .catch((err) => {
              console.error(
                `Failed to fetch catechists for train ID ${train.id}:`,
                err
              );
            });
        });
      } else {
        console.log("No items found");
      }
    } catch (err) {
      console.error("Không thể lấy danh sách đào tạo:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        disableLoading();
      }, 900);
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchTrains();
    storeCurrentPath(PATH_ADMIN.training_lists);
  }, []);

  const handleCreate = () => navigate("/admin/create-training-lists");

  const handleEditTrainClick = (id: string): void => {
    const train = trains.find((t) => t.id === id);
    if (!train) return;

    if (train.trainingListStatus === trainingListStatus.NotStarted) {
      navigate(`/admin/update-training-lists/${id}`);
    } else if (train.trainingListStatus === trainingListStatus.Training) {
      navigate(`/admin/update-training-lists/${id}`, {
        state: { editStatusOnly: true },
      });
    } else {
      sweetAlert.alertWarning(
        "Không thể chỉnh sửa!",
        "Danh sách đào tạo đã kết thúc, không thể chỉnh sửa.",
        2000,
        false
      );
    }
  };

  const handleDeleteTrainClick = async (id: string) => {
    const trainingToDelete = trains.find((train) => train.id === id);

    if (!trainingToDelete) {
      sweetAlert.alertWarning(
        "Lỗi!",
        "Không tìm thấy thông tin khóa đào tạo.",
        2000,
        false
      );
      return;
    }

    // Kiểm tra status và số lượng người tham gia
    const trainingCatechists = catechists[id] || [];
    if (
      trainingToDelete.trainingListStatus !== trainingListStatus.NotStarted &&
      trainingCatechists.length > 0
    ) {
      sweetAlert.alertWarning(
        "Không thể xóa!",
        "Không thể xóa khóa đào tạo đã có Giáo lý viên tham gia.",
        2000,
        false
      );
      return;
    }

    // Kiểm tra ngày đào tạo
    const trainingDate = new Date(trainingToDelete.startDate);
    const currentDate = new Date();

    if (trainingDate <= currentDate) {
      sweetAlert.alertWarning(
        "Không thể xóa!",
        "Không thể xóa khóa đào tạo đã bắt đầu hoặc đã kết thúc.",
        2000,
        false
      );
      return;
    }

    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa đào tạo này không?",
      "",
      undefined,
      undefined,
      "question"
    );

    if (!confirm) {
      return;
    }

    trainApi
      .deleteTrain(id)
      .then(() => {
        sweetAlert.alertSuccess(
          "Xóa thành công!",
          `Khóa đào tạo đã được xóa thành công.`,
          2000,
          false
        );
        setTrains(trains.filter((train) => train.id !== id));
      })
      .catch((err: Error) => {
        console.error(`Không thể xóa khóa đào tạo với ID: ${id}`, err);
        sweetAlert.alertFailed(
          "Xóa thất bại!",
          "Đã xảy ra lỗi khi xóa khóa đào tạo.",
          2000,
          false
        );
      });
  };

  interface TrainingLists {
    startDate: string | number | Date;
    id: string;
    name: string;
    description: string;
    certificateId: string;
    certificate: Certificate;
    previousLevelId: string;
    nextLevelId: string;
    previousLevel?: Level; // Optional if API provides it
    nextLevel?: Level; // Optional if API provides it
    startTime: string;
    endTime: string;
    trainingListStatus: number;
  }
  interface Certificate {
    id: string;
    name: string;
    image: File | null;
    description: string;
    levelId: string;
  }
  interface Level {
    id: string;
    hierarchyLevel: number; // Hoặc kiểu dữ liệu phù hợp
  }
  const determineStatusLabel = (train: TrainingLists): string => {
    if (train.trainingListStatus == 0) {
      return trainingListStatusLabel[trainingListStatus.NotStarted]; // "Chưa bắt đầu"
    }
    if (train.trainingListStatus == 1) {
      return trainingListStatusLabel[trainingListStatus.Training]; // "Chưa bắt đầu"
    }
    if (train.trainingListStatus == 2) {
      return trainingListStatusLabel[trainingListStatus.Finished]; // "Chưa bắt đầu"
    }

    return ""; // Default empty if no status applies
  };

  const handleAddOrUpdateCatechist = (
    trainId: string,
    catechistCount: number
  ) => {
    const selectedTrain = trains.find((train) => train.id === trainId);
    if (selectedTrain) {
      navigate("/admin/training-catechist", {
        state: {
          trainingInfo: {
            id: selectedTrain.id,
            name: selectedTrain.name,
            previousLevelId: selectedTrain.previousLevel?.id,
            previousLevel:
              selectedTrain.previousLevel?.hierarchyLevel ||
              levelMap[selectedTrain.previousLevelId],
            nextLevelId: selectedTrain.nextLevel?.id,
            nextLevel:
              selectedTrain.nextLevel?.hierarchyLevel ||
              levelMap[selectedTrain.nextLevelId],
            startTime: selectedTrain.startTime,
            endTime: selectedTrain.endTime,
            description: selectedTrain.description,
            currentCatechistCount: catechistCount,
          },
        },
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Tên",
      width: 200,
    },
    { field: "description", headerName: "Mô tả", width: 170 },
    {
      field: "previousLevel",
      headerName: "Cấp bậc trước",
      width: 120,
      renderCell: (params: any) =>
        params.row.previousLevel?.hierarchyLevel ||
        levelMap[params.row.previousLevelId] ||
        "Không xác định",
    },
    {
      field: "nextLevel",
      headerName: "Cấp bậc tiếp theo",
      width: 135,
      renderCell: (params: any) =>
        params.row.nextLevel?.hierarchyLevel ||
        levelMap[params.row.nextLevelId] ||
        "Không xác định",
    },
    {
      field: "startTime",
      headerName: "Ngày bắt đầu",
      width: 120,
      renderCell: (params: any) =>
        new Date(params.row.startTime).toLocaleDateString("vi-VN"),
    },
    {
      field: "endTime",
      headerName: "Ngày kết thúc",
      width: 120,
      renderCell: (params: any) =>
        new Date(params.row.endTime).toLocaleDateString("vi-VN"),
    },
    {
      field: "catechists",
      headerName: "Số lượng Giáo lý viên",
      width: 165,
      renderCell: (params) =>
        catechists[params.row.id]?.length ? (
          <>
            {catechists[params.row.id]?.length}
            {determineStatusLabel(params.row) ===
              trainingListStatusLabel[trainingListStatus.NotStarted] && (
              <Button
                className="btn btn-primary"
                color="primary"
                variant="outlined"
                onClick={() =>
                  handleAddOrUpdateCatechist(
                    params.row.id,
                    catechists[params.row.id]?.length || 0
                  )
                }
                sx={{ marginLeft: "10px" }}
              >
                Cập nhật
              </Button>
            )}
          </>
        ) : (
          <Button
            color="secondary"
            variant="contained"
            onClick={() =>
              handleAddOrUpdateCatechist(
                params.row.id,
                catechists[params.row.id]?.length || 0
              )
            }
          >
            Thêm
          </Button>
        ),
    },
    {
      field: "trainingListStatus",
      headerName: "Trạng thái",
      width: 130,
      renderCell: (params) => {
        const status = params.row.trainingListStatus as trainingListStatus;
        return (
          <span
            className={`
          ${params.row.trainingListStatus == trainingListStatus.NotStarted ? "rounded-xl py-1 px-2 bg-black text-white" : ""}
          ${params.row.trainingListStatus == trainingListStatus.Training ? "rounded-xl py-1 px-2 bg-primary text-white" : ""}
          ${params.row.trainingListStatus == trainingListStatus.Finished ? "rounded-xl py-1 px-2 bg-success text-white" : ""}
          `}
          >
            {trainingListStatusLabel[status] || "Không xác định"}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 205,
      renderCell: (params) => (
        <div className="space-x-2">
          <Button
            className="btn btn-primary"
            color="primary"
            variant="outlined"
            onClick={() => handleEditTrainClick(params.row.id)}
          >
            Chỉnh sửa
          </Button>
          <Button
            className="btn btn-danger"
            color="error"
            variant="outlined"
            onClick={() => handleDeleteTrainClick(params.row.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (!init) return <></>;

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Danh sách đào tạo
      </h1>
      <div className="flex justify-end mb-3 mt-3 px-3 gap-x-2">
        {selectedIds.length === 1 ? (
          <>
            <Button
              className="hover:border-purple-800 hover:bg-purple-800 hover:text-white"
              color="secondary"
              variant="outlined"
              onClick={() => {
                const row = trains.find(
                  (item) => item.id === selectedIds[0].toString()
                );
                if (row) {
                  navigate(`/admin/training-list/${row.id}/catechists`, {
                    state: {
                      trainingInfo: {
                        id: row.id,
                        name: row.name,
                        previousLevel:
                          row.previousLevel?.hierarchyLevel ||
                          levelMap[row.previousLevelId],
                        nextLevel:
                          row.nextLevel?.hierarchyLevel ||
                          levelMap[row.nextLevelId],
                        startTime: row.startTime,
                        endTime: row.endTime,
                        description: row.description,
                        currentCatechistCount: catechists[row.id]?.length || 0,
                      },
                    },
                  });
                }
              }}
            >
              Xem chi tiết
            </Button>
          </>
        ) : (
          <></>
        )}

        <Button
          className="btn btn-success"
          color="success"
          variant="outlined"
          onClick={handleCreate}
        >
          Tạo danh sách
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            fetchTrains();
          }}
        >
          Tải lại
        </Button>
      </div>
      <div className="px-3">
        {trains.length <= 0 && init && !loading ? (
          <p className="mx-2 font-bold text-[1.2rem]">
            Hiện tại không có danh sách đào tạo nào
          </p>
        ) : (
          <></>
        )}
        <>
          <DataGrid
            rows={trains}
            columns={columns}
            loading={loading}
            paginationMode="client"
            localeText={viVNGridTranslation}
            getRowId={(row) => row.id}
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedIds(newSelection);
            }}
            checkboxSelection
            disableMultipleRowSelection
            sx={{
              height: 480,
              overflowX: "auto",
              "& .MuiDataGrid-root": {
                overflowX: "auto",
              },
            }}
          />
        </>
      </div>
    </Paper>
  );
};

export default ListAllTrain;
