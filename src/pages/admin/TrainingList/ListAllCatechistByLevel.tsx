import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import catechistApi from "../../../api/Catechist";
import trainApi from "../../../api/TrainingList";
import catInTrainApi from "../../../api/CatechistInTraining";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useLocation } from 'react-router-dom';
import levelApi from "../../../api/Level";

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
  const [catechistsToAssign, setCatechistsToAssign] = useState<any[]>([]); // Catechists chuẩn bị gán
  const [trainings, setTrainings] = useState<any[]>([]); // Danh sách training từ API
  const navigate = useNavigate();
  const location = useLocation();
  const trainingInfo = location.state?.trainingInfo as TrainingInfo;
  const [trainingCatechists, setTrainingCatechists] = useState<any[]>([]);
  const [currentTraining, setCurrentTraining] = useState<TrainingInfo | null>(null);
  useEffect(() => {
    if (trainingInfo) {
      setCurrentTraining(trainingInfo);
    }
  }, [trainingInfo]);

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

  // // Lấy danh sách trainings từ API
  useEffect(() => {
    trainApi
      .getAllTrain()
      .then((res: AxiosResponse) => {
        const data: BasicResponse = res.data;
        if (data.statusCode === 200) {
          setTrainings(data.data.items || []);
          console.log(trainings)
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách Trainings:", err);
      });
  }, []);

  // Thêm useEffect để load danh sách Catechists đã gán khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (currentTraining?.id) {
        try {
          // 1. Lấy danh sách levels
          const levelResponse = await levelApi.getAllLevel();
          const levelMap: { [key: string]: number } = {};
          levelResponse.data.data.items.forEach((level: Level) => {
            levelMap[level.id] = level.hierarchyLevel;
          });
    
          // 2. Lấy danh sách catechists đã gán
          const assignedResponse = await trainApi.getCatechistsByTrainingListId(currentTraining.id);
          const assignedCatechists = assignedResponse.data.data.items.map((item: any) => ({
            id: item.catechist.id,
            fullName: item.catechist.fullName,
            level: item.catechist.level,
            levelId: item.catechist.levelId,
            status: item.catechistInTrainingStatus
          }));
    
          // 3. Map lại level
          const mappedAssignedCatechists = assignedCatechists.map((catechist: Catechist) => ({
            ...catechist,
            level: {
              hierarchyLevel: levelMap[catechist.levelId || ''] || currentTraining.previousLevel
            }
          }));
    
          // 4. Xử lý catechists chưa gán
          const allCatechistsResponse = await catechistApi.getAllCatechists();
          const allCatechists = allCatechistsResponse.data.data.items || [];
          
          const assignedIds = mappedAssignedCatechists.map((c: Catechist) => c.id);
          const unassignedCatechists = allCatechists.filter(
            catechist => !assignedIds.includes(catechist.id)
          );
    
          // 5. Set state
          setAssignedCatechists(mappedAssignedCatechists);
          setTrainingCatechists(mappedAssignedCatechists);
          setCatechists(unassignedCatechists);
          console.log(trainingCatechists);
        } catch (error) {
          console.error("Lỗi khi load dữ liệu ban đầu:", error);
        }
      }
    };
    loadInitialData();
  }, [currentTraining?.id]);

  // Thêm catechist vào danh sách đã gán
  const handleAddCatechistToTraining = (catechistId: string) => {
    const selectedCatechist = catechists.find((catechist) => catechist.id === catechistId);

    // Kiểm tra cấp bậc
    if (selectedCatechist?.level?.hierarchyLevel !== currentTraining?.previousLevel) {
      alert("Không trùng với cấp bậc cần thiết");
      return;
    }

    if (selectedCatechist) {
      setAssignedCatechists((prev) => [...prev, selectedCatechist]);
      setCatechists((prev) => prev.filter((catechist) => catechist.id !== catechistId));

      setCatechistsToAssign((prev) => [
        ...prev,
        { ...selectedCatechist, status: 0 },
      ]);
      console.log(catechistsToAssign)
    }
  };

  const isValidLevel = (catechistLevel: number | string | undefined) => {
    return catechistLevel === currentTraining?.previousLevel;
  };

  // Xóa catechist khỏi danh sách đã gán
 
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
    if (assignedCatechists.length === 0) {
      alert("Không có Catechist nào để cập nhật.");
      return;
    }

    try {
      if (!currentTraining?.id) {
        alert("Không tìm thấy thông tin khóa đào tạo!");
        return;
      }

      const formattedCatechists = assignedCatechists.map(c => ({
        id: c.id,
        status: 0
      }));

      const response = await catInTrainApi.updateCatInTrain(currentTraining.id, formattedCatechists);

      if (response.status === 200 || response.status === 201) {
        // Cập nhật lại danh sách training
        setTrainingCatechists(assignedCatechists);
        alert("Cập nhật danh sách Catechists thành công!");
        navigate("/admin/training-lists");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật danh sách!");
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
  //     alert("Có lỗi xảy ra khi reload danh sách Catechists!");
  //   }
  // };

  const renderTrainingInfo = () => {
    if (!currentTraining) return null;
    return (
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-center mb-4">Danh sách giáo lý viên tham gia khóa đào tạo ({currentTraining.name})</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Cấp bậc cần thiết tham gia:</strong> Cấp {currentTraining.previousLevel}</p>
            <p><strong>Cấp bậc sau khi hoàn thành:</strong> Cấp {currentTraining.nextLevel}</p>
          </div>
          <div>
            <p><strong>Ngày bắt đầu:</strong> {new Date(currentTraining.startTime).toLocaleDateString('vi-VN')}</p>
            <p><strong>Ngày kết thúc:</strong> {new Date(currentTraining.endTime).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
        <div className="mt-2">
          <p><strong>Mô tả:</strong> {currentTraining.description}</p>
          <p><strong>Số lượng giáo lý viên hiện tại trong khóa đào tạo:</strong> {currentTraining.currentCatechistCount}</p>
        </div>
      </div>
    );
  };

  return (
    <AdminTemplate>
      <div className="container mt-5">
        {renderTrainingInfo()}
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
                        disabled={!isValidLevel(catechist.level?.hierarchyLevel)}
                        style={{
                          backgroundColor: isValidLevel(catechist.level?.hierarchyLevel)
                            ? undefined
                            : '#ccc'
                        }}
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