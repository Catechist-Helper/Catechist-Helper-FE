import React, { useState, useEffect } from "react";
import trainApi from "../../../api/TrainingList";
import levelApi from "../../../api/Level";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate, Link } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import {
  trainingListStatus,
  trainingListStatusLabel,
} from "../../../enums/TrainingList";

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
interface Level {
  id: string;
  hierarchyLevel: number; // Hoặc kiểu dữ liệu phù hợp
}
interface Certificate {
  id: string;
  name: string;
  image: File | null;
  description: string;
  levelId: string;
}
const ListAllTrain: React.FC = () => {
  const [trains, setTrains] = useState<TrainingLists[]>([]);
  const [catechists, setCatechists] = useState<{ [key: string]: any[] }>({});
  const navigate = useNavigate();
  const [levelMap, setLevelMap] = useState<{ [key: string]: string }>({});
  // const [certificates, setCertificates] = useState<any[]>([]);
  // const [certificateMap, setCertificateMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    levelApi
      .getAllLevel()
      .then((res: AxiosResponse) => {
        const levels = res.data.data.items || [];
        // Tạo map từ levelId -> levelName
        const map: { [key: string]: string } = {};
        levels.forEach((level: any) => {
          map[level.id] = level.name;
        });
        setLevelMap(map);
      })
      .catch((err) => console.error("Lỗi khi lấy danh sách cấp độ:", err));
  }, []);

  useEffect(() => {
    trainApi
      .getAllTrain()
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          setTrains(res.data.items);

          // Fetch Catechists for each training list
          res.data.items.forEach((train: any) => {
            trainApi
              .getCatechistsByTrainingListId(train.id)
              .then((catechistRes: AxiosResponse) => {
                const catechistData = catechistRes.data;
                setCatechists((prevMap) => ({
                  ...prevMap,
                  [train.id]: catechistData.data.items || [],
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
      })
      .catch((err) => {
        console.error("Không thấy danh sách đào tạo:", err);
      });
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0"); // Add leading zero to day
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Add leading zero to month
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const determineStatusLabel = (train: TrainingLists): string => {
    console.log("hhhhh", train);
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

  const renderActionCell = (train: TrainingLists): JSX.Element => {
    return <span>{determineStatusLabel(train)}</span>;
  };

  const handleCreate = () => {
    navigate("/admin/create-training-lists");
  };

  const handleEditTrainClick = (id: string): void => {
    const train = trains.find((t) => t.id === id);
    if (!train) return;

    if (train.trainingListStatus === 0) {
      // Chưa bắt đầu - cho phép chỉnh sửa tất cả
      navigate(`/admin/update-training-lists/${id}`);
    } else if (train.trainingListStatus === 1) {
      // Đang đào tạo - chỉ cho phép chỉnh sửa status
      navigate(`/admin/update-training-lists/${id}`, {
        state: { editStatusOnly: true },
      });
    } else {
      // Đã kết thúc - không cho chỉnh sửa gì cả
      sweetAlert.alertWarning(
        "Không thể chỉnh sửa!",
        "Danh sách đào tạo đã kết thúc, không thể chỉnh sửa.",
        2000,
        false
      );
    }
  };
  // const handleEditTrainClick = (id: string): void => {
  //     navigate(`/admin/update-training-lists/${id}`);
  // }

  const handleTrainingCatechistClick = () => {
    navigate(`/admin/training-catechist`);
  };
  const handleDeleteTrainClick = async (id: string) => {
    // Lấy thông tin khóa đào tạo cần xóa
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

    // Kiểm tra ngày đào tạo
    const trainingDate = new Date(trainingToDelete.startDate); // Giả sử có trường startDate
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

    // Kiểm tra số lượng Catechist trong training
    const trainingCatechists = catechists[id] || [];

    if (trainingCatechists.length > 0) {
      sweetAlert.alertWarning(
        "Không thể xóa!",
        "Không thể xóa khóa đào tạo đã có Giáo lý viên tham gia.",
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

    if (confirm) {
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
    }
  };

  // const handleAddOrUpdateCatechist = (trainId: string, catechistCount: number) => {
  //     if (catechistCount === 0) {
  //         navigate(`/admin/training-catechist`);
  //     } else {
  //         navigate(`/admin/training-catechist`);
  //     }
  // };
  // Trong ListAllTrain.tsx, thêm useEffect mới để lắng nghe sự thay đổi:

  useEffect(() => {
    const fetchCatechistsForTrain = async (trainId: string) => {
      try {
        const train = trains.find((t) => t.id === trainId);
        if (!train) return;

        const response = await trainApi.getCatechistsByTrainingListId(trainId);
        const items = response.data.data.items;

        // Nếu training chưa bắt đầu (status = 0), loại bỏ catechist có status = 3 (Không đạt)
        if (train.trainingListStatus === 0) {
          const activeItems = items.filter(
            (item: any) => item.catechistInTrainingStatus !== 3
          );
          setCatechists((prev) => ({
            ...prev,
            [trainId]: activeItems,
          }));
        } else {
          // Nếu training đang đào tạo (1) hoặc kết thúc (2), hiển thị tất cả
          setCatechists((prev) => ({
            ...prev,
            [trainId]: items,
          }));
        }
      } catch (err) {
        console.error(
          `Failed to fetch catechists for train ID ${trainId}:`,
          err
        );
      }
    };

    trains.forEach((train) => {
      fetchCatechistsForTrain(train.id);
    });
  }, [trains]);

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

  return (
    <div className="container mt-5">
      <div className="mb-10 text-center fw-bold">
        <h1>DANH SÁCH ĐÀO TẠO</h1>
      </div>
      <div className="d-flex align-items-center mb-3">
        <button
          className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200 me-3"
          onClick={handleCreate}
        >
          Tạo danh sách
        </button>
        <button
          className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200"
          onClick={handleTrainingCatechistClick}
        >
          Danh sách đào tạo
        </button>
      </div>

      <div className="flex relative overflow-x-auto justify-center p-6">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
            <tr className="text-center">
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3">Mô tả</th>
              <th className="px-6 py-3">Cấp bậc trước</th>
              <th className="px-6 py-3">Bậc cấp tiếp theo</th>
              <th className="px-6 py-3">Ngày bắt đầu</th>
              <th className="px-6 py-3">Ngày kết thúc</th>
              <th className="px-6 py-3">Số lượng Giáo lí viên</th>
              {/* <th className="px-6 py-3">Chứng chỉ</th> */}
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {trains.length > 0 ? (
              trains
                .filter((train: any) => !train.isDeleted)
                .map((train: any) => (
                  <tr
                    key={train.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                    >
                      <div className="text-dark">
                        <Link
                          to={`/admin/training-list/${train.id}/catechists`}
                          className="text-dark"
                          state={{
                            trainingInfo: {
                              id: train.id,
                              name: train.name,
                              previousLevel:
                                train.previousLevel?.hierarchyLevel ||
                                levelMap[train.previousLevelId],
                              nextLevel:
                                train.nextLevel?.hierarchyLevel ||
                                levelMap[train.nextLevelId],
                              startTime: train.startTime,
                              endTime: train.endTime,
                              description: train.description,
                              currentCatechistCount:
                                catechists[train.id]?.length || 0,
                            },
                          }}
                        >
                          {train.name}
                        </Link>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-center">
                      {train.description}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                      {/* Kiểm tra nếu có hierarchyLevel từ previousLevel thì hiển thị, nếu không dùng fallback từ levelMap */}
                      {train.previousLevel?.hierarchyLevel ||
                        levelMap[train.previousLevelId] ||
                        "Không xác định"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Hiển thị hierarchyLevel hoặc tên của cấp tiếp theo */}
                      {train.nextLevel?.hierarchyLevel ||
                        levelMap[train.nextLevelId] ||
                        "Không xác định"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {formatDate(train.startTime)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {formatDate(train.endTime)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {catechists[train.id]?.length || 0}
                      {determineStatusLabel(train) ===
                        trainingListStatusLabel[
                          trainingListStatus.NotStarted
                        ] && (
                        <button
                          className="btn btn-primary ml-3"
                          onClick={() =>
                            handleAddOrUpdateCatechist(
                              train.id,
                              catechists[train.id]?.length || 0
                            )
                          }
                        >
                          {catechists[train.id]?.length === 0
                            ? "Thêm"
                            : "Cập nhật"}
                        </button>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-center">
                                            {train.certificate ? (
                                                <div>
                                                    <div><b>Tên:</b> {train.certificate.name || "Không xác định"}</div>
                                                    <div><b>Mô tả:</b> {train.certificate.description || "Không có mô tả"}</div>
                                                    <div>
                                                        <b>Level ID:</b> {train.certificate.levelId || "Không có Level ID"}
                                                    </div>
                                                </div>
                                            ) : (
                                                "Chưa có chứng chỉ"
                                            )}
                                        </td> */}
                    {/* <td className="px-6 py-4 text-center">
                                            {isCompleteButtonVisible(train.endTime) && train.trainingListStatus !== trainingListStatus.Finished ? (
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleComplete(train)}
                                                >
                                                    Complete
                                                </button>
                                            ) : (
                                                train.trainingListStatus === trainingListStatus.Finished ? "Đã hoàn thành" : "Chưa kết thúc"
                                            )}
                                        </td> */}
                    <td className="px-6 py-4 text-center">
                      {renderActionCell(train)}
                    </td>

                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEditTrainClick(train.id)}
                        className="btn btn-info"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTrainClick(train.id)}
                        className="btn btn-warning"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">
                  Không thấy danh sách đào tạo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListAllTrain;
