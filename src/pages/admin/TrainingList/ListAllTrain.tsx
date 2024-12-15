import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import trainApi from "../../../api/TrainingList";
import levelApi from "../../../api/Level";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { Link, useNavigate } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import viVNGridTranslation from "../../../locale/MUITable";
import {
  trainingListStatus,
  trainingListStatusLabel,
} from "../../../enums/TrainingList";

const ListAllTrain: React.FC = () => {
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [init, setInit] = useState<boolean>(false);

  const [catechists, setCatechists] = useState<{ [key: string]: any[] }>({});
  const [levelMap, setLevelMap] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchTrains();
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
    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa đào tạo này không?",
      "",
      undefined,
      undefined,
      "question"
    );
    if (confirm) {
      try {
        await trainApi.deleteTrain(id);
        sweetAlert.alertSuccess(
          "Xóa thành công!",
          "Khóa đào tạo đã được xóa.",
          2000,
          false
        );
        setTrains((prev) => prev.filter((train) => train.id !== id));
      } catch (err) {
        console.error("Xóa đào tạo thất bại:", err);
        sweetAlert.alertFailed("Xóa thất bại!", "Đã xảy ra lỗi.", 2000, false);
      }
    }
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
            previousLevel:
              selectedTrain.previousLevel?.hierarchyLevel ||
              levelMap[selectedTrain.previousLevelId],
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
      renderCell: (params) => {
        return (
          <Link
            to={`/admin/training-list/${params.row.id}/catechists`}
            className="py-2 px-2 text-dark hover:bg-blue-300 rounded-xl hover:text-white"
            state={{
              trainingInfo: {
                id: params.row.id,
                name: params.row.name,
                previousLevel:
                  params.row.previousLevel?.hierarchyLevel ||
                  levelMap[params.row.previousLevelId],
                nextLevel:
                  params.row.nextLevel?.hierarchyLevel ||
                  levelMap[params.row.nextLevelId],
                startTime: params.row.startTime,
                endTime: params.row.endTime,
                description: params.row.description,
                currentCatechistCount: catechists[params.row.id]?.length || 0,
              },
            }}
          >
            {params.row.name}
          </Link>
        );
      },
    },
    { field: "description", headerName: "Mô tả", width: 200 },
    {
      field: "previousLevel",
      headerName: "Cấp bậc trước",
      width: 150,
      renderCell: (params: any) =>
        params.row.previousLevel?.hierarchyLevel ||
        levelMap[params.row.previousLevelId] ||
        "Không xác định",
    },
    {
      field: "nextLevel",
      headerName: "Cấp bậc tiếp theo",
      width: 150,
      renderCell: (params: any) =>
        params.row.nextLevel?.hierarchyLevel ||
        levelMap[params.row.nextLevelId] ||
        "Không xác định",
    },
    {
      field: "startTime",
      headerName: "Ngày bắt đầu",
      width: 140,
      renderCell: (params: any) =>
        new Date(params.row.startTime).toLocaleDateString("vi-VN"),
    },
    {
      field: "endTime",
      headerName: "Ngày kết thúc",
      width: 140,
      renderCell: (params: any) =>
        new Date(params.row.endTime).toLocaleDateString("vi-VN"),
    },
    {
      field: "catechists",
      headerName: "Số lượng Giáo lý viên",
      width: 200,
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
                // onClick={() =>
                //   navigate("/admin/training-catechist", {
                //     state: { trainingId: params.row.id },
                //   })
                // }
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
              navigate("/admin/training-catechist", {
                state: { trainingId: params.row.id },
              })
            }
          >
            Thêm
          </Button>
        ),
    },
    {
      field: "trainingListStatus",
      headerName: "Trạng thái",
      width: 180,
      renderCell: (params) => {
        const status = params.row.trainingListStatus as trainingListStatus;
        return trainingListStatusLabel[status] || "Không xác định";
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 250,
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
  console.log("tranins", trains);
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
        DANH SÁCH ĐÀO TẠO
      </h1>
      <div className="flex justify-end mb-3 mt-3 px-3 gap-x-2">
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
      <div className="px-2">
        {trains.length > 0 && init ? (
          <>
            <DataGrid
              rows={trains}
              columns={columns}
              loading={loading}
              paginationMode="client"
              localeText={viVNGridTranslation}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
            />
          </>
        ) : (
          <></>
        )}
      </div>
    </Paper>
  );
};

export default ListAllTrain;
