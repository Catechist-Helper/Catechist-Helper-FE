import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import trainApi from "../../../api/TrainingList";
import catInTrainApi from "../../../api/CatechistInTraining";
// import certificateOfCateApi from "../../../api/CertificateOfCatechist";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useNavigate } from "react-router-dom";
import { catechistInTrainingStatusLabel } from "../../../enums/CatechistInTraining";
// import sweetAlert from "../../../utils/sweetAlert";
// import { storage } from '../../../config/firebaseConfig';
// import { ref, getDownloadURL } from "firebase/storage";

interface Catechist {
  id: string;
  fullName: string;
  status: number;
  level?: number | string;
}


const ListAllTrainCatechist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [catechists, setCatechists] = useState<Catechist[]>([]);
  const [trainingStartDate, setTrainingStartDate] = useState<Date | null>(null);
  const [trainingEndDate, setTrainingEndDate] = useState<Date | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<number>(0);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  // Fetch all catechists and training details
  const fetchCatechists = async () => {
    try {
      // Get training details và check status
      const trainingResponse = await trainApi.getById(id!);
      const trainingData = trainingResponse.data.data;
      const startDate = new Date(trainingData.startTime);
      const endDate = new Date(trainingData.endTime);
      const currentTrainingStatus = trainingData.trainingListStatus;
  
      setTrainingStartDate(startDate);
      setTrainingEndDate(endDate);
      setTrainingStatus(currentTrainingStatus);
  
      // Get catechists from training
      const response = await trainApi.getCatechistsByTrainingListId(id!);
      let items = response.data?.data?.items || [];
  
      // Nếu training status = 1, cập nhật tất cả catechist có status = 0 lên status = 1
      if (currentTrainingStatus === 1) {
        const needsUpdate = items.some((item: any) => 
          item.catechistInTrainingStatus === 0
        );
  
        if (needsUpdate) {
          const updatedCatechists = items.map((item: any) => ({
            id: item.catechist.id,
            status: item.catechistInTrainingStatus === 0 ? 1 : item.catechistInTrainingStatus
          }));
  
          // Cập nhật status lên API
          await catInTrainApi.updateCatInTrain(id!, updatedCatechists);
  
          // Fetch lại data sau khi cập nhật
          const refreshResponse = await trainApi.getCatechistsByTrainingListId(id!);
          items = refreshResponse.data?.data?.items || [];
        }
      }
  
      // Map data
      const fetchedCatechists = items
        .filter((item: { catechist: any; }) => item && item.catechist)
        .map((item: any) => ({
          id: item.catechist.id,
          fullName: item.catechist.fullName,
          status: item.catechistInTrainingStatus,
          levelId: item.catechist.levelId,
          level: item.catechist.level?.hierarchyLevel
        }));

      const now = new Date();

      // Filter catechists based on status and training dates
      const filteredCatechists = fetchedCatechists.filter(
        (catechist: Catechist) => {
          if (now < startDate && catechist.status === 2) {
            // Remove Failed catechists before training starts
            return false;
          }
          return true; // Keep all other catechists
        }
      );
      setCatechists(fetchedCatechists);
      console.log('Processed catechists:', fetchedCatechists); // Debug processed data
      setCatechists(filteredCatechists);
    } catch (error) {
      console.error("Error fetching catechists:", error);
    }
  };


  const updateStatus = async (catechistId: string, newStatus: number) => {
    const now = new Date();

    if (trainingStartDate && now < trainingStartDate) {
      if (newStatus === 2) {
        alert("Không thể đặt trạng thái thành 'Hoàn thành' trước khi khóa đào tạo bắt đầu.");
        return;
      }
      // Nếu status = 3 (Không Đạt) trước khi khóa học bắt đầu
      if (newStatus === 3) {
        const confirmRemove = window.confirm(
          "Bạn có chắc chắn muốn đánh giá Catechist này 'Không Đạt' và loại khỏi danh sách không?"
        );
        if (!confirmRemove) {
          return;
        }
      }
    }

    if (trainingEndDate && now > trainingEndDate) {
      const currentStatus = catechists.find(cat => cat.id === catechistId)?.status;

      // Nếu đang ở trạng thái Hoàn thành, không cho chuyển về 0 hoặc 2
      if (currentStatus === 2 && (newStatus === 0 || newStatus === 1 || newStatus === 3)) {
        alert("Không thể thay đổi trạng thái sau khi đã Hoàn thành khóa đào tạo.");
        return;
      }

      // Nếu đang ở trạng thái Không Đạt, không cho chuyển về 0 hoặc 1
      if (currentStatus === 3 && (newStatus === 0 || newStatus === 1 || newStatus === 2)) {
        alert("Không thể thay đổi trạng thái sau khi đã được đánh giá Không Đạt.");
        return;
      }
    }

    try {
      // Chuẩn bị payload cho API
      const payload = catechists.map((cat) => ({
        id: cat.id,
        status: cat.id === catechistId ? newStatus : cat.status,
      }));

      // Gửi PUT request
      const response = await catInTrainApi.updateCatInTrain(id!, payload);

      if (response.status === 200 || response.status === 201) {
        // Nếu status = 1 (Hoàn thành), thêm Catechist vào Certificate
        if (newStatus === 3 && trainingStartDate && new Date() < trainingStartDate) {
          // Nếu đánh giá "Không Đạt" trước khi khóa học bắt đầu, 
          // cập nhật state để loại bỏ Catechist khỏi danh sách
          setCatechists(prevCatechists =>
            prevCatechists.filter(cat => cat.id !== catechistId)
          );
        } else {
          // Trong các trường hợp khác, cập nhật lại toàn bộ danh sách
          await fetchCatechists();
        }
      } else {
        console.error("Update failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Fetch catechists when the component mounts or when the training ID changes
  useEffect(() => {
    fetchCatechists();
  }, [id]);

  return (
    <AdminTemplate>
      <div className="container mt-5">
        <h1 className="text-center fw-bold mb-10">
          Danh sách Giáo lý viên trong khóa đào tạo
        </h1>
        <div className="mt-4">
          {catechists.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Tên giáo lý viên</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {catechists.map((catechist) => (
                  <tr key={catechist.id}>
                    <td>{catechist.fullName}</td>
                    <td>
                      <select
                        className="form-select"
                        value={catechist.status}
                        onChange={(e) =>
                          updateStatus(
                            catechist.id,
                            parseInt(e.target.value, 10)
                          )
                        }
                      >
                        {Object.entries(catechistInTrainingStatusLabel).map(([key, label]) => {
                          const keyNum = parseInt(key, 10);
                          const isDisabled =
                            // 1. Trước khi bắt đầu - chỉ cho phép status 0 (Chưa đào tạo)
                            (!!trainingStartDate && new Date() < trainingStartDate &&
                              (keyNum === 1 || keyNum === 2 || keyNum === 3)) ||

                            // 2. Trong quá trình đào tạo - cho phép status 1 (Đang đào tạo) và 3 (Không đạt)
                            // Disable status 0 (Chưa đào tạo) và 2 (Hoàn thành)
                            (!!trainingStartDate && !!trainingEndDate &&
                              new Date() >= trainingStartDate && new Date() <= trainingEndDate &&
                              (keyNum === 0 || keyNum === 2)) ||

                            // 3. Sau khi kết thúc
                            (!!trainingEndDate && new Date() > trainingEndDate && (
                              // Luôn disable status 0 (Chưa đào tạo)
                              keyNum === 0 ||
                              // Nếu status hiện tại là Hoàn thành (2), disable các status khác
                              (catechist.status === 2 && (keyNum === 0 || keyNum === 1 || keyNum === 3)) ||
                              // Nếu status hiện tại là Không đạt (3), disable các status khác
                              (catechist.status === 3 && (keyNum === 0 || keyNum === 1 || keyNum === 2))
                            ));


                          return (
                            <option
                              key={key}
                              value={key}
                              disabled={isDisabled}
                            >
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">
              Không có Catechist nào trong danh sách đào tạo.
            </p>
          )}
        </div>
        <div className="flex items-start mb-5">
          <button
            type="button"
            className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-5"
            onClick={handleGoBack}
          >
            Quay lại
          </button>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default ListAllTrainCatechist;
