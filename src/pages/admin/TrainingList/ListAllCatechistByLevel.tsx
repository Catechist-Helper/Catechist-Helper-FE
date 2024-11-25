import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import catechistApi from "../../../api/Catechist";
import trainApi from "../../../api/TrainingList";
import catInTrainApi from "../../../api/CatechistInTraining";
import { AxiosResponse, AxiosError } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";

const ListCatechistByLevel: React.FC = () => {
  const [catechists, setCatechists] = useState<any[]>([]); // Danh sách catechists chưa gán
  const [assignedCatechists, setAssignedCatechists] = useState<any[]>([]); // Danh sách catechists đã gán
  const [catechistsToAssign, setCatechistsToAssign] = useState<any[]>([]); // Catechists chuẩn bị gán
  const [trainings, setTrainings] = useState<any[]>([]); // Danh sách training từ API
  const navigate = useNavigate();
  // Lấy danh sách catechists từ API
  useEffect(() => {
    catechistApi
      .getAllCatechists()
      .then((res: AxiosResponse) => {
        const data: BasicResponse = res.data;
        if (data.statusCode === 200) {
          setCatechists(data.data.items || []);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách Catechists:", err);
      });
  }, []);

  // Lấy danh sách trainings từ API
  useEffect(() => {
    trainApi
      .getAllTrain()
      .then((res: AxiosResponse) => {
        const data: BasicResponse = res.data;
        if (data.statusCode === 200) {
          setTrainings(data.data.items || []);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách Trainings:", err);
      });
  }, []);

  // Thêm catechist vào danh sách đã gán
  const handleAddCatechistToTraining = (catechistId: string) => {
    const selectedCatechist = catechists.find((catechist) => catechist.id === catechistId);
    if (selectedCatechist) {
      setAssignedCatechists((prev) => [...prev, selectedCatechist]);
      setCatechists((prev) => prev.filter((catechist) => catechist.id !== catechistId));

      // Lưu catechist vào array để truyền API
      setCatechistsToAssign((prev) => [...prev, { ...selectedCatechist, status: 0 }]);
    }
  };

  // Xóa catechist khỏi danh sách đã gán
  const handleRemoveCatechistFromTraining = (catechistId: string) => {
    const removedCatechist = assignedCatechists.find((catechist) => catechist.id === catechistId);
    if (removedCatechist) {
      setAssignedCatechists((prev) => prev.filter((catechist) => catechist.id !== catechistId));
      setCatechists((prev) => [...prev, removedCatechist]);

      // Xóa catechist khỏi array để truyền API
      setCatechistsToAssign((prev) => prev.filter((catechist) => catechist.id !== catechistId));
    }
  };

  const handleConfirm = async () => {
    if (catechistsToAssign.length === 0) {
      alert("Không có Catechist nào được gán.");
      return;
    }
  
    // Nhóm các Catechist theo Training
    const groupedPayload = trainings.map((training: any) => {
      const assignedCatechists = catechistsToAssign
        .filter(
          (catechist) =>
            catechist.level?.hierarchyLevel === training.previousLevel?.hierarchyLevel
        )
        .map((catechist) => ({
          id: catechist.id,
          status: 0, // Trạng thái mặc định
        }));
  
      return {
        trainingListId: training.id,
        catechists: assignedCatechists,
      };
    });
  
    // Loại bỏ các nhóm không có Catechist
    const validGroupedPayload = groupedPayload.filter((group) => group.catechists.length > 0);
  
    if (validGroupedPayload.length === 0) {
      alert("Không có Catechist nào hợp lệ để gán.");
      return;
    }
  
    try {
      for (const group of validGroupedPayload) {
        const response = await catInTrainApi.updateCatInTrain(group.trainingListId, group.catechists);
  
        if (response.status === 200 || response.status === 201) {
          console.log(`Gán Catechists thành công vào Training ${group.trainingListId}`);
        } else {
          console.error("API trả về trạng thái không thành công:", response);
          alert("Có lỗi xảy ra khi gán Catechists.");
          return;
        }
      }
  
      alert("Gán Catechists thành công!");
      navigate("/admin/training-lists")
      setCatechistsToAssign([]); // Reset danh sách sau khi gán thành công
      reloadCatechists(); // Reload lại danh sách Catechists chưa gán
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as any;
        console.error("Lỗi từ API:", errorData);
        // alert(API Error: ${errorData.title || "Lỗi không xác định từ API"});
      } else {
        console.error("Lỗi không xác định:", err);
        alert("Có lỗi xảy ra!");
      }
    }
  };
  const reloadCatechists = async () => {
  try {
    const catechistRes = await catechistApi.getAllCatechists();
    const catechistData: BasicResponse = catechistRes.data;

    const trainingRes = await trainApi.getAllTrain();
    const trainingData: BasicResponse = trainingRes.data;

    if (catechistData.statusCode === 200 && trainingData.statusCode === 200) {
      const assignedIds = trainingData.data.items.flatMap((training: any) =>
        training.assignedCatechists?.map((catechist: any) => catechist.id) || []
      );

      // Lọc các Catechists chưa gán
      const unassignedCatechists = catechistData.data.items.filter(
        (catechist: any) => !assignedIds.includes(catechist.id)
      );

      setCatechists(unassignedCatechists); // Cập nhật danh sách Catechist chưa gán
      setTrainings(trainingData.data.items || []); // Cập nhật danh sách Training
    }
  } catch (error) {
    console.error("Lỗi khi reload danh sách Catechists:", error);
    alert("Có lỗi xảy ra khi reload danh sách Catechists!");
  }
};  

  return (
    <AdminTemplate>
      <div className="container mt-5">
        <div className="text-center fw-bold">
          <h1>Danh sách Catechists</h1>
        </div>

        {/* Danh sách catechists chưa gán */}
        <div className="mt-4">
          <h3 className="text-center">Danh sách Catechists chưa gán</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Cấp bậc</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {catechists.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Không có Catechists nào
                  </td>
                </tr>
              ) : (
                catechists.map((catechist) => (
                  <tr key={catechist.id}>
                    <td>{catechist.fullName}</td>
                    <td>{catechist.level?.hierarchyLevel || "N/A"}</td>
                    <td>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddCatechistToTraining(catechist.id)}
                      >
                        Thêm
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Danh sách catechists đã gán */}
        <div className="mt-5">
          <h3 className="text-center">Danh sách Catechists đã gán</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Cấp bậc</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedCatechists.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Không có Catechists nào đã gán
                  </td>
                </tr>
              ) : (
                assignedCatechists.map((catechist) => (
                  <tr key={catechist.id}>
                    <td>{catechist.fullName}</td>
                    <td>{catechist.level?.hierarchyLevel || "N/A"}</td>
                    <td>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleRemoveCatechistFromTraining(catechist.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-end mt-4">
          <Button variant="contained" color="success" onClick={handleConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default ListCatechistByLevel;