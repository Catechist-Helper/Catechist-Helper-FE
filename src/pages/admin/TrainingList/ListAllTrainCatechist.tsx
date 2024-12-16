import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import trainApi from "../../../api/TrainingList";
import catInTrainApi from "../../../api/CatechistInTraining";
// import certificateOfCateApi from "../../../api/CertificateOfCatechist";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useNavigate } from "react-router-dom";
import {
  catechistInTrainingStatus,
  catechistInTrainingStatusLabel,
} from "../../../enums/CatechistInTraining";
import { useLocation } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import { Button, MenuItem, Select } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import viVNGridTranslation from "../../../locale/MUITable";

interface Catechist {
  id: string;
  fullName: string;
  status: number;
  level?: number | string;
}

interface TrainingInfo {
  id: string;
  name: string;
  previousLevel: string | number;
  nextLevel: string | number;
  startTime: string;
  endTime: string;
  description: string;
  currentCatechistCount: number;
}

const ListAllTrainCatechist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [catechists, setCatechists] = useState<Catechist[]>([]);
  const [trainingData, setTrainingData] = useState<any>(null);
  const location = useLocation();
  const trainingInfo = location.state?.trainingInfo as TrainingInfo;
  const [trainingStatus, setTrainingStatus] = useState<number>(0);
  const [currentTraining, setCurrentTraining] = useState<TrainingInfo | null>(
    null
  );
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (trainingInfo) {
      setCurrentTraining(trainingInfo);
    }
  }, [trainingInfo]);

  // Fetch all catechists and training details
  const fetchCatechists = async () => {
    try {
      // Get training details và check status
      const trainingResponse = await trainApi.getById(id!);
      const trainingData = trainingResponse.data.data;
      const currentTrainingStatus = trainingData.trainingListStatus;

      setTrainingStatus(currentTrainingStatus);

      // Get catechists from training
      const response = await trainApi.getCatechistsByTrainingListId(id!);
      let items = response.data?.data?.items || [];

      // Nếu training status = 1, cập nhật tất cả catechist có status = 0 lên status = 1
      if (currentTrainingStatus === 1) {
        const needsUpdate = items.some(
          (item: any) => item.catechistInTrainingStatus === 0
        );

        if (needsUpdate) {
          const updatedCatechists = items.map((item: any) => ({
            id: item.catechist.id,
            status:
              item.catechistInTrainingStatus === 0
                ? 1
                : item.catechistInTrainingStatus,
          }));

          // Cập nhật status lên API
          await catInTrainApi.updateCatInTrain(id!, updatedCatechists);

          // Fetch lại data sau khi cập nhật
          const refreshResponse = await trainApi.getCatechistsByTrainingListId(
            id!
          );
          items = refreshResponse.data?.data?.items || [];
        }
      }

      // Map data
      const fetchedCatechists = items
        .filter((item: { catechist: any }) => item && item.catechist)
        .map((item: any) => ({
          id: item.catechist.id,
          fullName: item.catechist.fullName,
          status: item.catechistInTrainingStatus,
          levelId: item.catechist.levelId,
          level: item.catechist.level?.hierarchyLevel,
        }));

      // Filter catechists based on training status
      const filteredCatechists = fetchedCatechists.filter(
        (catechist: Catechist) => {
          // Chỉ loại bỏ catechist có status = 3 khi training đang ở status = 0 (Chưa bắt đầu)
          if (currentTrainingStatus === 0 && catechist.status === 3) {
            return false;
          }
          // Giữ lại tất cả catechist khi training đang ở status 1 hoặc 2
          return true;
        }
      );

      setCatechists(filteredCatechists);
    } catch (error) {
      console.error("Error fetching catechists:", error);
    }
  };

  const handleRemoveCatechistFromTraining = async (catechistId: string) => {
    // Xóa catechist khỏi danh sách hiển thị
    setCatechists((prevCatechists) =>
      prevCatechists.filter((cat) => cat.id !== catechistId)
    );

    try {
      // Gọi API để cập nhật danh sách đã loại bỏ catechist
      const updatedCatechists = catechists
        .filter((cat) => cat.id !== catechistId)
        .map((cat) => ({
          id: cat.id,
          status: cat.status,
        }));

      await catInTrainApi.updateCatInTrain(id!, updatedCatechists);
    } catch (error) {
      console.error("Error removing catechist:", error);
    }
  };

  const updateStatus = async (catechistId: string, newStatus: number) => {
    try {
      // Kiểm tra dựa vào trạng thái của Training
      if (trainingStatus === 0) {
        // Chưa bắt đầu
        if (newStatus === 2) {
          sweetAlert.alertWarning(
            "Không thể đặt trạng thái thành 'Hoàn thành' khi khóa đào tạo chưa bắt đầu.",
            "",
            5000,
            30
          );
          return;
        }

        if (newStatus === 3) {
          const confirmRemove = await sweetAlert.confirm(
            "Bạn có chắc chắn muốn đánh giá giáo lý viên này 'Không Đạt' và loại khỏi danh sách không?",
            "",
            undefined,
            undefined,
            "question"
          );
          if (!confirmRemove) {
            return;
          }
          // Chỉ xóa khỏi danh sách giao diện, không gửi status = 3 lên API
          handleRemoveCatechistFromTraining(catechistId);
          return;
        }
      }

      const currentStatus = catechists.find(
        (cat) => cat.id === catechistId
      )?.status;

      // Kiểm tra các điều kiện dựa vào status của catechist
      if (currentStatus === 2) {
        sweetAlert.alertWarning(
          "Không thể thay đổi trạng thái sau khi đã Hoàn thành khóa đào tạo.",
          "",
          5000,
          30
        );
        return;
      }

      if (currentStatus === 3) {
        sweetAlert.alertWarning(
          "Không thể thay đổi trạng thái sau khi đã được đánh giá Không Đạt.",
          "",
          5000,
          30
        );
        return;
      }

      const payload = catechists.map((cat) => ({
        id: cat.id,
        status: cat.id === catechistId ? newStatus : cat.status,
      }));

      const response: { status: number } = await catInTrainApi.updateCatInTrain(
        id!,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        // Chỉ loại bỏ khỏi danh sách nếu status training = 0 và catechist được chuyển sang status = 3
        if (newStatus === 3 && trainingStatus === 0) {
          setCatechists((prevCatechists) =>
            prevCatechists.filter((cat) => cat.id !== catechistId)
          );
        } else {
          await fetchCatechists();
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        const trainingResponse = await trainApi.getById(id!);
        setTrainingData(trainingResponse.data.data);
        setTrainingStatus(trainingResponse.data.data.trainingListStatus);
      } catch (error) {
        console.error("Error fetching training data:", error);
      }
    };

    fetchTrainingData();
  }, [id]);
  // Fetch catechists when the component mounts or when the training ID changes
  useEffect(() => {
    fetchCatechists();
  }, [id]);

  const renderTrainingInfo = () => {
    if (!currentTraining) return null;
    return (
      <div className="mb-6 p-6 border-4 border-[#AF8260] rounded-lg bg-white shadow-lg">
        <h2 className="text-center mb-6 text-3xl font-bold text-[#422A14]">
          Thông tin khóa đào tạo {trainingData?.name}
        </h2>
        <div className="flex flex-col md:flex-row justify-between gap-8 px-4">
          <div className="flex-1 space-y-4 pl-10">
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Cấp bậc cần thiết tham gia:
              </span>
              <span className="text-gray-700 ml-2">
                Cấp {trainingData?.previousLevel?.hierarchyLevel}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Cấp bậc sau khi hoàn thành:
              </span>
              <span className="text-gray-700 ml-2">
                Cấp {trainingData?.nextLevel?.hierarchyLevel}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Số lượng giáo lý viên hiện tại:
              </span>
              <span className="text-gray-700 ml-2">{catechists.length}</span>
            </p>
          </div>
          <div className="flex-1 space-y-4">
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Mô tả:
              </span>
              <span className="text-gray-700 ml-2">
                {trainingData?.description}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Ngày bắt đầu:
              </span>
              <span className="text-gray-700 ml-2">
                {new Date(trainingData?.startTime).toLocaleDateString("vi-VN")}
              </span>
            </p>
            <p>
              <span className="font-semibold text-[#6B4423] text-lg pl-20">
                Ngày kết thúc:
              </span>
              <span className="text-gray-700 ml-2">
                {new Date(trainingData?.endTime).toLocaleDateString("vi-VN")}
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
      headerName: "Tên giáo lý viên",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const catechist = params.row;

        return (
          <Select
            fullWidth
            value={catechist.status}
            onChange={(e) =>
              updateStatus(catechist.id, parseInt(e.target.value as string, 10))
            }
            size="small"
            sx={{
              backgroundColor: "white",
              borderColor: "gray.300",
              borderRadius: "8px",
            }}
            className={`
              ${catechist.status == catechistInTrainingStatus.NotStarted ? "bg-black text-white" : ""}
              ${catechist.status == catechistInTrainingStatus.Training ? "bg-primary text-white" : ""}
              ${catechist.status == catechistInTrainingStatus.Completed ? "bg-success text-white" : ""}
              ${catechist.status == catechistInTrainingStatus.Failed ? "bg-danger text-white" : ""}
            `}
          >
            {Object.entries(catechistInTrainingStatusLabel).map(
              ([key, label]) => {
                const keyNum = parseInt(key, 10);
                const isDisabled =
                  // 1. Khi Training chưa bắt đầu (status = 0)
                  (trainingStatus === 0 && keyNum === 2) ||
                  (trainingStatus === 0 && (keyNum === 1 || keyNum === 2)) ||
                  // 2. Khi Training đang đào tạo (status = 1)
                  (trainingStatus === 1 &&
                    (keyNum === 0 ||
                      keyNum === 2 ||
                      (catechist.status === 3 && keyNum === 1))) ||
                  // 3. Khi Training kết thúc (status = 2)
                  (trainingStatus === 2 &&
                    (keyNum === 0 ||
                      (catechist.status === 2 &&
                        (keyNum === 1 || keyNum === 3)) ||
                      (catechist.status === 3 &&
                        (keyNum === 1 || keyNum === 2))));

                return (
                  <MenuItem
                    key={key}
                    value={keyNum}
                    disabled={isDisabled}
                    className={`
              ${!isDisabled && keyNum == catechistInTrainingStatus.NotStarted ? "bg-black text-white" : ""}
              ${!isDisabled && keyNum == catechistInTrainingStatus.Training ? "bg-primary text-white" : ""}
              ${!isDisabled && keyNum == catechistInTrainingStatus.Completed ? "bg-success text-white" : ""}
              ${!isDisabled && keyNum == catechistInTrainingStatus.Failed ? "bg-danger text-white" : ""}
            `}
                  >
                    {label}
                  </MenuItem>
                );
              }
            )}
          </Select>
        );
      },
    },
  ];

  return (
    <AdminTemplate>
      <div className="container mt-5">
        {renderTrainingInfo()}
        <div className="mt-4">
          <h2 className="text-center mb-6 text-3xl font-bold text-[#422A14]">
            Danh sách giáo lý viên tham gia khóa đào tạo
          </h2>
          {catechists.length > 0 ? (
            <>
              <DataGrid
                rows={catechists}
                columns={columns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                localeText={viVNGridTranslation}
              />
            </>
          ) : (
            <p className="text-center text-gray-500">
              Hiện không có giáo lý viên nào trong danh sách đào tạo
            </p>
          )}
        </div>
        <div className="text-end mt-4">
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
      </div>
    </AdminTemplate>
  );
};

export default ListAllTrainCatechist;
