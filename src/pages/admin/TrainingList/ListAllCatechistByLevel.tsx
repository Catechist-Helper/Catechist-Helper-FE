import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import catechistApi from "../../../api/Catechist";
import trainApi from "../../../api/TrainingList";
import catInTrainApi from "../../../api/CatechistInTraining";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useLocation } from "react-router-dom";
import levelApi from "../../../api/Level";
import sweetAlert from "../../../utils/sweetAlert";
import useAppContext from "../../../hooks/useAppContext";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import viVNGridTranslation from "../../../locale/MUITable";

interface TrainingInfo {
  id: string;
  name: string;
  previousLevel: string | number;
  nextLevel: string | number;
  previousLevelId: string;
  nextLevelId: string;
  startTime: string;
  endTime: string;
  description: string;
  currentCatechistCount: number;
  trainingListStatus: number;
}

interface Level {
  id: string;
  hierarchyLevel: number;
  name: string;
}

interface Catechist {
  id: string;
  fullName: string;
  level?: Level;
  levelId?: string;
  status?: number;
}

const ListCatechistByLevel: React.FC = () => {
  const [catechists, setCatechists] = useState<any[]>([]); // Danh sách catechists chưa gán
  const [assignedCatechists, setAssignedCatechists] = useState<any[]>([]); // Danh sách catechists đã gán
  // const [catechistsToAssign, setCatechistsToAssign] = useState<any[]>([]); // Catechists chuẩn bị gán
  // const [trainings, setTrainings] = useState<any[]>([]); // Danh sách training từ API
  const navigate = useNavigate();
  const location = useLocation();
  const trainingInfo = location.state?.trainingInfo as TrainingInfo;
  // const [trainingCatechists, setTrainingCatechists] = useState<any[]>([]);
  const [currentTraining, setCurrentTraining] = useState<TrainingInfo | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    if (trainingInfo) {
      setCurrentTraining({
        ...trainingInfo,
        trainingListStatus: trainingInfo.trainingListStatus, // Đảm bảo lấy được giá trị này từ API
      });
    }
  }, [trainingInfo]);

  const handleGoBack = () => {
    navigate(-1);
  };
  // Lấy danh sách catechists từ API
  useEffect(() => {
    const fetch = async () => {
      const firstRes = await catechistApi.getAllCatechists();
      await catechistApi
        .getAllCatechists(1, firstRes.data.data.total)
        .then((res: AxiosResponse) => {
          const data: BasicResponse = res.data;
          if (data.statusCode === 200) {
            setCatechists(
              data.data.items.filter(
                (item: any) =>
                  item.isTeaching &&
                  item.level.id == currentTraining?.previousLevelId
              ) || []
            );
          }
        })
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách Catechists:", err);
        });
    };
    fetch();
  }, []);

  // // Lấy danh sách trainings từ API
  // useEffect(() => {
  //   trainApi
  //     .getAllTrain()
  //     .then((res: AxiosResponse) => {
  //       const data: BasicResponse = res.data;
  //       if (data.statusCode === 200) {
  //         setTrainings(data.data.items || []);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Lỗi khi lấy danh sách Trainings:", err);
  //     });
  // }, []);

  // Thêm useEffect để load danh sách Catechists đã gán khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      enableLoading();
      if (currentTraining?.id) {
        try {
          // 1. Get all training lists first
          const firstTrainRes = await trainApi.getAllTrain();
          const allTrainingsResponse = await trainApi.getAllTrain(
            1,
            firstTrainRes.data.data.total
          );
          const allTrainings = allTrainingsResponse.data.data.items || [];

          // 2. Create a Set to store Catechist IDs that should not appear
          const excludedCatechistIds = new Set();

          for (const training of allTrainings) {
            if (training.id !== currentTraining.id) {
              const assignedResponse =
                await trainApi.getCatechistsByTrainingListId(training.id);
              const assignedCatechists = assignedResponse.data.data.items || [];

              assignedCatechists.forEach((item: any) => {
                // Chỉ loại trừ catechist khi status là 0 (Chưa đào tạo) hoặc 1 (Đang đào tạo)
                if (
                  item.catechistInTrainingStatus === 0 ||
                  item.catechistInTrainingStatus === 1
                ) {
                  excludedCatechistIds.add(item.catechist.id);
                }
                // Status 2 (Hoàn thành) và 3 (Không đạt) sẽ được hiển thị lại trong danh sách
              });
            }
          }

          // 1. Lấy danh sách levels
          const levelResponse = await levelApi.getAllLevel();
          const levelMap: { [key: string]: number } = {};
          levelResponse.data.data.items.forEach((level: Level) => {
            levelMap[level.id] = level.hierarchyLevel;
          });

          // 2. Lấy danh sách catechist trong training hiện tại
          const currentTrainingResponse =
            await trainApi.getCatechistsByTrainingListId(currentTraining.id);

          const currentAssignedCatechists =
            currentTrainingResponse.data.data.items.map((item: any) => ({
              id: item.catechist.id,
              fullName: item.catechist.fullName,
              level: item.catechist.level,
              levelId: item.catechist.levelId,
              status: item.catechistInTrainingStatus,
            }));

          const mappedAssignedCatechists = currentAssignedCatechists.map(
            (catechist: Catechist) => ({
              ...catechist,
              level: {
                hierarchyLevel:
                  levelMap[catechist.levelId || ""] ||
                  currentTraining.previousLevel,
              },
            })
          );

          // 3. Lấy tất cả catechist và lọc
          const firstRes = await catechistApi.getAllCatechists();

          const allCatechistsResponse = await catechistApi.getAllCatechists(
            1,
            firstRes.data.data.total
          );
          const allCatechists =
            allCatechistsResponse.data.data.items.filter(
              (item: any) =>
                item.isTeaching &&
                item.level.id == currentTraining?.previousLevelId
            ) || [];

          const unassignedCatechists = allCatechists.filter((catechist) => {
            // Kiểm tra xem catechist có trong training hiện tại không
            const currentAssignment = mappedAssignedCatechists.find(
              (assigned: { id: string; status: number }) =>
                assigned.id === catechist.id
            );

            // Nếu catechist đang trong một training khác với status 0 hoặc 1
            if (excludedCatechistIds.has(catechist.id)) {
              return false;
            }

            // Nếu không có trong training hiện tại -> hiển thị
            if (!currentAssignment) {
              return true;
            }

            // Nếu có trong training hiện tại:
            // - Hiển thị nếu status = 2 (Hoàn thành) hoặc 3 (Không đạt)
            // - Không hiển thị nếu status = 0 (Chưa đào tạo) hoặc 1 (Đang đào tạo)
            return (
              currentAssignment.status === 2 || currentAssignment.status === 3
            );
          });

          // 4. Set state
          setAssignedCatechists(mappedAssignedCatechists);
          // setTrainingCatechists(mappedAssignedCatechists);
          setCatechists(unassignedCatechists);
        } catch (error) {
          console.error("Lỗi khi load dữ liệu ban đầu:", error);
        } finally {
          setTimeout(() => {
            setLoading(false);
            disableLoading();
          }, 1000);
        }
      } else {
        setLoading(false);
        disableLoading();
      }
    };
    loadInitialData();
  }, [currentTraining?.id]);

  // Thêm catechist vào danh sách đã gán
  const handleAddCatechistToTraining = (catechistId: string) => {
    const selectedCatechist = catechists.find(
      (catechist) => catechist.id === catechistId
    );

    // Kiểm tra cấp bậc
    if (
      selectedCatechist?.level?.hierarchyLevel !==
      currentTraining?.previousLevel
    ) {
      sweetAlert.alertWarning(
        "Không trùng với cấp bậc cần thiết",
        "",
        3000,
        28
      );
      return;
    }

    if (selectedCatechist) {
      setAssignedCatechists((prev) => [...prev, selectedCatechist]);
      setCatechists((prev) =>
        prev.filter((catechist) => catechist.id !== catechistId)
      );

      // setCatechistsToAssign((prev) => [
      //   ...prev,
      //   { ...selectedCatechist, status: 0 },
      // ]);
    }
  };

  const isValidLevel = (catechistLevel: number | string | undefined) => {
    return catechistLevel === currentTraining?.previousLevel;
  };

  // Xóa catechist khỏi danh sách đã gán

  // Xóa catechist khỏi danh sách đã gán
  const handleRemoveCatechistFromTraining = async (catechistId: string) => {
    const removedCatechist = assignedCatechists.find(
      (catechist) => catechist.id === catechistId
    );

    if (removedCatechist) {
      try {
        if (!currentTraining?.id) {
          sweetAlert.alertWarning(
            "Không tìm thấy thông tin khóa đào tạo!",
            "",
            3000,
            28
          );
          return;
        }

        // Loại bỏ catechist khỏi danh sách gửi lên API
        const updatedCatechists = assignedCatechists
          .filter((cat) => cat.id !== catechistId)
          .map((c) => ({
            id: c.id,
            status: c.status || 0,
          }));

        // Gọi API để cập nhật
        const response = await catInTrainApi.updateCatInTrain(
          currentTraining.id,
          updatedCatechists
        );

        if (response.status === 200 || response.status === 201) {
          // Cập nhật state
          setAssignedCatechists((prev) =>
            prev.filter((cat) => cat.id !== catechistId)
          );

          // Kiểm tra status của training hiện tại
          if (currentTraining.trainingListStatus !== 0) {
            setCatechists((prev) => [removedCatechist, ...prev]);
          }
          // setCatechistsToAssign((prev) =>
          //   prev.filter((cat) => cat.id !== catechistId)
          // );
        } else {
          sweetAlert.alertFailed("Có lỗi xảy ra khi cập nhật danh sách!");
        }
      } catch (error) {
        console.error("Lỗi khi xóa Catechist:", error);
        sweetAlert.alertFailed("Có lỗi xảy ra khi xóa Giáo lý viên!");
      }
    }
  };

  const handleConfirm = async () => {
    if (assignedCatechists.length === 0) {
      sweetAlert.alertWarning("Không có giáo lý viên nào để cập nhật.");
      return;
    }

    try {
      if (!currentTraining?.id) {
        sweetAlert.alertWarning("Không tìm thấy thông tin khóa đào tạo!");
        return;
      }

      const formattedCatechists = assignedCatechists.map((c) => ({
        id: c.id,
        status: 0,
      }));

      const response = await catInTrainApi.updateCatInTrain(
        currentTraining.id,
        formattedCatechists
      );

      if (response.status === 200 || response.status === 201) {
        // Cập nhật lại danh sách training
        // setTrainingCatechists(assignedCatechists);
        sweetAlert.alertSuccess("Cập nhật danh sách giáo lý viên thành công!");
        navigate("/admin/training-lists");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi cập nhật danh sách!");
    }
  };

  // const reloadCatechists = async () => {
  //   try {
  //     const catechistRes = await catechistApi.getAllCatechists();
  //     const catechistData: BasicResponse = catechistRes.data;

  //     const trainingRes = await trainApi.getAllTrain();
  //     const trainingData: BasicResponse = trainingRes.data;

  //     if (catechistData.statusCode === 200 && trainingData.statusCode === 200) {
  //       const assignedIds = trainingData.data.items.flatMap((training: any) =>
  //         training.assignedCatechists?.map((catechist: any) => catechist.id) || []
  //       );

  //       // Lọc các Catechists chưa gán
  //       const unassignedCatechists = catechistData.data.items.filter(
  //         (catechist: any) => !assignedIds.includes(catechist.id)
  //       );

  //       setCatechists(unassignedCatechists); // Cập nhật danh sách Catechist chưa gán
  //       setTrainings(trainingData.data.items || []); // Cập nhật danh sách Training
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi reload danh sách Catechists:", error);
  //     sweetAlert.alertFailed("Có lỗi xảy ra khi reload danh sách Catechists!");
  //   }
  // };

  const renderTrainingInfo = () => {
    if (!currentTraining) return null;
    return (
      <div className="mb-6 p-6 border-4 border-[#AF8260] rounded-lg bg-white shadow-lg">
        <h2 className="text-center mb-6 text-3xl font-bold text-[#422A14]">
          Thông tin của khóa đào tạo {currentTraining.name}
        </h2>
        <div className="flex flex-col md:flex-row justify-between gap-8 px-4 ">
          <div className="flex-1 space-y-4 pl-10">
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Cấp bậc cần thiết tham gia:
              </span>
              <span className="text-gray-700 ml-2">
                Cấp {currentTraining.previousLevel}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Cấp bậc sau khi hoàn thành:
              </span>
              <span className="text-gray-700 ml-2">
                Cấp {currentTraining.nextLevel}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Số lượng giáo lý viên hiện tại:
              </span>
              <span className="text-gray-700 ml-2">
                {currentTraining.currentCatechistCount}
              </span>
            </p>
          </div>
          <div className="flex-1 space-y-4">
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Mô tả:
              </span>
              <span className="text-gray-700 ml-2">
                {currentTraining.description}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Ngày bắt đầu:
              </span>
              <span className="text-gray-700 ml-2">
                {new Date(currentTraining.startTime).toLocaleDateString(
                  "vi-VN"
                )}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Ngày kết thúc:
              </span>
              <span className="text-gray-700 ml-2">
                {new Date(currentTraining.endTime).toLocaleDateString("vi-VN")}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: "Tên",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "hierarchyLevel",
      headerName: "Cấp bậc",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.level?.hierarchyLevel || "N/A",
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={
            isValidLevel(params.row.level?.hierarchyLevel)
              ? "primary"
              : "inherit"
          }
          disabled={!isValidLevel(params.row.level?.hierarchyLevel)}
          onClick={() => handleAddCatechistToTraining(params.row.id)}
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        >
          Thêm
        </Button>
      ),
    },
  ];

  const columnsAssigned: GridColDef[] = [
    {
      field: "fullName",
      headerName: "Tên",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "hierarchyLevel",
      headerName: "Cấp bậc",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => params.row.level?.hierarchyLevel || "N/A",
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={"error"}
          onClick={() => handleRemoveCatechistFromTraining(params.row.id)}
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [paginationModel2, setPaginationModel2] = useState<GridPaginationModel>(
    {
      page: 0,
      pageSize: 8,
    }
  );

  return (
    <AdminTemplate>
      <div className="container mt-5">
        {renderTrainingInfo()}

        {loading ? (
          <></>
        ) : (
          <>
            <div className="text-center text-l font-semibold">
              <h2 className="text-center mb-6 text-3xl font-bold text-[#422A14]">
                Danh sách Giáo lý viên tham gia khóa đào tạo
              </h2>
            </div>

            {/* Danh sách catechists chưa gán */}
            <div className="mt-4">
              <h4 className="text-center text-xl font-semibold ">
                Danh sách Giáo lý viên chưa gán
              </h4>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                {catechists.length === 0 ? (
                  <>
                    <p className="px-6 py-3 text-left text-gray-500">
                      Hiện không có Giáo lý viên nào trong danh sách
                    </p>
                  </>
                ) : (
                  <>
                    <DataGrid
                      rows={catechists}
                      columns={columns}
                      getRowId={(row) => row.id}
                      disableRowSelectionOnClick
                      localeText={viVNGridTranslation}
                      paginationModel={paginationModel}
                      pageSizeOptions={[8, 10, 25, 50, 100, 250]}
                      onPaginationModelChange={setPaginationModel}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Danh sách catechists đã gán */}
            <div className="mt-4">
              <h3 className="text-center text-xl font-semibold ">
                Danh sách Giáo lý viên đã gán
              </h3>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                {assignedCatechists.length === 0 ? (
                  <>
                    <p className="px-6 py-3 text-left text-gray-500">
                      Không có Giáo lý viên nào đã gán
                    </p>
                  </>
                ) : (
                  <>
                    <DataGrid
                      rows={assignedCatechists}
                      columns={columnsAssigned}
                      getRowId={(row) => row.id}
                      disableRowSelectionOnClick
                      localeText={viVNGridTranslation}
                      paginationModel={paginationModel2}
                      pageSizeOptions={[8, 10, 25, 50, 100, 250]}
                      onPaginationModelChange={setPaginationModel2}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="text-end mt-4  flex justify-end gap-x-2">
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirm}
              >
                Xác nhận
              </Button>
              <Button
                type="button"
                color="primary"
                className="btn btn-primary"
                variant="outlined"
                onClick={handleGoBack}
              >
                Quay lại
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminTemplate>
  );
};

export default ListCatechistByLevel;
