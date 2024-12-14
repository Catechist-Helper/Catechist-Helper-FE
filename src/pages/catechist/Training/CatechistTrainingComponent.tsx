import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import catechistApi from "../../../api/Catechist";
import { getUserInfo } from "../../../utils/utils";
import { formatDate } from "../../../utils/formatDate";
import viVNGridTranslation from "../../../locale/MUITable";
import {
  catechistInTrainingStatus,
  catechistInTrainingStatusString,
} from "../../../enums/CatechistInTraining";
import {
  trainingListStatus,
  trainingListStatusString,
} from "../../../enums/TrainingList";

const CatechistTrainingComponent = () => {
  const [userLogin, setUserLogin] = useState<any>(null);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [selectedIds, setSelectedIds] = useState<GridRowSelectionModel>([]);

  // Fetch thông tin người dùng đã đăng nhập
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userLoggedin = getUserInfo(); // Hàm lấy thông tin người dùng đăng nhập
        setUserLogin(userLoggedin);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTraining = async () => {
      if (userLogin && userLogin.catechistId) {
        setLoading(true);
        try {
          const response = await catechistApi.getTrainingsOfCatechist(
            userLogin.catechistId
          );
          if (response.data.data.trainingInformation) {
            setTrainings(response.data.data.trainingInformation);
          }
        } catch (error) {
          console.error("Error fetching classes:", error);
        }
        setLoading(false);
      }
    };
    fetchTraining();
  }, [userLogin]);

  console.log("trainings", trainings);

  // Columns cho DataGrid
  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên lớp", width: 200 },
    { field: "previousLevel", headerName: "Cấp độ tham gia", width: 180 },
    { field: "nextLevel", headerName: "Cấp độ khi hoàn thành", width: 200 },
    {
      field: "startTime",
      headerName: "Thời gian bắt đầu",
      width: 170,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.value),
    },
    {
      field: "endTime",
      headerName: "Thời gian kết thúc",
      width: 170,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.value),
    },
    {
      field: "trainingListStatus",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => {
        switch (params.value) {
          case trainingListStatus.NotStarted:
            return (
              <span className="py-1 px-2 rounded-xl text-white bg-black">
                {trainingListStatusString.NotStarted}
              </span>
            );
          case trainingListStatus.Training:
            return (
              <span className="py-1 px-2 rounded-xl text-black bg-info">
                {trainingListStatusString.Training}
              </span>
            );
          case trainingListStatus.Finished:
            return (
              <span className="py-1 px-2 rounded-xl text-white bg-success">
                {trainingListStatusString.Finished}
              </span>
            );
          default:
            return <></>;
        }
      },
    },
    {
      field: "catechistInTrainingStatus",
      headerName: "Kết quả",
      width: 150,
      renderCell: (params) => {
        switch (params.value) {
          case catechistInTrainingStatus.Training:
            return (
              <span className="py-1 px-2 rounded-xl text-black bg-warning ">
                {catechistInTrainingStatusString.Training}
              </span>
            );
          case catechistInTrainingStatus.Completed:
            return (
              <span className="py-1 px-2 rounded-xl text-white bg-success">
                {catechistInTrainingStatusString.Completed}
              </span>
            );
          case catechistInTrainingStatus.Failed:
            return (
              <span className="py-1 px-2 rounded-xl text-white bg-danger">
                {catechistInTrainingStatusString.Failed}
              </span>
            );
          default:
            return <></>;
        }
      },
    },
  ];

  if (!userLogin || !userLogin.id || !userLogin.catechistId) {
    return <></>;
  }

  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedIds(newSelectionModel);
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Thông tin các khóa đào tạo tham gia
      </h1>
      <div className="w-full px-3">
        {trainings.length <= 0 ? (
          <>
            <h1 className="text-[1.2rem] my-3">
              <strong>Hiện tại chưa tham gia khóa đào tạo nào</strong>
            </h1>
          </>
        ) : (
          <div className="w-full">
            <DataGrid
              rows={trainings}
              columns={columns}
              paginationMode="client"
              rowCount={trainings.length}
              loading={loading}
              initialState={{ pagination: { paginationModel } }}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel} // Cập nhật paginationModel khi thay đổi
              pageSizeOptions={[10, 25, 50, 100, 250]}
              onRowSelectionModelChange={handleSelectionChange}
              rowSelectionModel={selectedIds}
              // checkboxSelection
              disableMultipleRowSelection
              sx={{
                border: 0,
              }}
              localeText={viVNGridTranslation}
            />
          </div>
        )}
      </div>
    </Paper>
  );
};

export default CatechistTrainingComponent;
