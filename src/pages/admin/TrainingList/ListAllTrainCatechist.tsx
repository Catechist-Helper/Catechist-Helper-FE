import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import trainApi from "../../../api/TrainingList";
import catInTrainApi from "../../../api/CatechistInTraining";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useNavigate } from "react-router-dom";
import { catechistInTrainingStatusLabel } from "../../../enums/CatechistInTraining";

interface Catechist {
  id: string;
  fullName: string;
  status: number;
}

const ListAllTrainCatechist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [catechists, setCatechists] = useState<Catechist[]>([]);
  const [trainingStartDate, setTrainingStartDate] = useState<Date | null>(null);
  const [trainingEndDate, setTrainingEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
 };
  // Fetch all catechists and training details
  const fetchCatechists = async () => {
    try {
      // Fetch training details to get start and end dates
      const trainingResponse = await trainApi.getById(id!);
      const trainingData = trainingResponse.data.data;
      const startDate = new Date(trainingData.startTime);
      const endDate = new Date(trainingData.endTime);

      setTrainingStartDate(startDate);
      setTrainingEndDate(endDate);

      // Fetch catechists in the training list
      const response = await trainApi.getCatechistsByTrainingListId(id!);
      const fetchedCatechists = response.data.data.items.map((item: any) => ({
        id: item.catechist.id,
        fullName: item.catechist.fullName,
        status: item.catechistInTrainingStatus,
      }));

      const now = new Date();

      // Filter catechists based on status and training dates
      const filteredCatechists = fetchedCatechists.filter((catechist: Catechist) => {
        if (now < startDate && catechist.status === 2) {
          // Remove Failed catechists before training starts
          return false;
        }
        return true; // Keep all other catechists
      });

      setCatechists(filteredCatechists);
    } catch (error) {
      console.error("Error fetching catechists or training details:", error);
    }
  };

  // Update the status of a specific catechist and reflect it immediately in the UI
  const updateStatus = async (catechistId: string, newStatus: number) => {
    const now = new Date();

    // Ngăn không cho đổi trạng thái thành Completed trước ngày bắt đầu
    if (trainingStartDate && now < trainingStartDate && newStatus === 1) {
      console.error("Cannot set status to 'Completed' before training starts.");
      alert("Không thể đặt trạng thái thành 'Hoàn thành' trước khi khóa đào tạo bắt đầu.");
      return;
    }

    const payload = [{ id: catechistId, status: newStatus }];
    try {
      console.log("Sending payload:", payload);
      await catInTrainApi.updateCatInTrain(id!, payload); // Gửi API để cập nhật trạng thái
      console.log("Status updated successfully.");

      const updatedCatechists = catechists.map((catechist) =>
        catechist.id === catechistId ? { ...catechist, status: newStatus } : catechist
      );

      // Áp dụng bộ lọc sau khi cập nhật
      const filteredCatechists = updatedCatechists.filter((catechist) => {
        if (now < (trainingStartDate ?? now) && catechist.status === 2) {
          return false; // Loại bỏ catechist có trạng thái Failed trước khi đào tạo bắt đầu
        }
        return true;
      });

      setCatechists(filteredCatechists);
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
          Danh sách Catechist trong Training
        </h1>
        <div className="mt-4">
          {catechists.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Tên Catechist</th>
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
                        {Object.entries(catechistInTrainingStatusLabel).map(([key, label]) => (
                          <option
                            key={key}
                            value={key}
                            disabled={
                              !!trainingStartDate && // Chuyển trainingStartDate thành boolean
                              new Date() < trainingStartDate &&
                              parseInt(key, 10) === 1 // Vô hiệu hóa tùy chọn Completed trước khi đào tạo bắt đầu
                            }
                          >
                            {label}
                          </option>
                        ))}
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
