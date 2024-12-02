import React, { useState, useEffect } from "react";
import trainApi from "../../../api/TrainingList";
import levelApi from "../../../api/Level";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate, Link } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import { trainingListStatus, trainingListStatusLabel } from "../../../enums/TrainingList";
import { AxiosError } from "axios";
interface TrainingLists {
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
                if (res.statusCode.toString().trim().startsWith("2") && res.data.items != null) {
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
                                console.error(`Failed to fetch catechists for train ID ${train.id}:`, err);
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
        const day = date.getDate().toString().padStart(2, '0'); // Add leading zero to day
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero to month
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const determineStatusLabel = (train: TrainingLists): string => {
        const now = new Date();
        const startDate = new Date(train.startTime);
        const endDate = new Date(train.endTime);

        if (now < startDate) {
            return trainingListStatusLabel[trainingListStatus.NotStarted]; // "Chưa bắt đầu"
        } else if (now >= startDate && now <= endDate) {
            return trainingListStatusLabel[trainingListStatus.Training]; // "Đào tạo"
        } else if (train.trainingListStatus === trainingListStatus.Finished) {
            return trainingListStatusLabel[trainingListStatus.Finished]; // "Kết thúc"
        }

        return ""; // Default empty if no status applies
    };

    const renderActionCell = (train: TrainingLists): JSX.Element => {
        const now = new Date();
        const endDate = new Date(train.endTime);

        // Show Complete button only after the end date
        if (now > endDate && train.trainingListStatus !== trainingListStatus.Finished) {
            return (
                <button
                    className="btn btn-success"
                    onClick={() => handleComplete(train)}
                >
                    Complete
                </button>
            );
        }

        // Show status label if not Finished
        return <span>{determineStatusLabel(train)}</span>;
    };

    const handleComplete = async (train: TrainingLists): Promise<void> => {
        try {
            const previousLevelId = train.previousLevel?.id || ""; // Gửi ID thực hoặc giữ trống
            const nextLevelId = train.nextLevel?.id || ""; // Gửi ID thực hoặc giữ trống
            const certificateId = train.certificate?.id || ""; // Gửi ID thực hoặc giữ trống
            // Cập nhật payload với status là Finished
            const payload = {
                id: train.id,
                name: train.name,
                description: train.description,
                certificateId: certificateId, // Giữ nguyên giá trị certificateId từ state
                previousLevelId: previousLevelId, // Gửi ID hợp lệ
                nextLevelId: nextLevelId, // Gửi ID hợp lệ
                startTime: train.startTime,
                endTime: train.endTime,
                trainingListStatus: trainingListStatus.Finished, // Chuyển trạng thái thành Finished
            };

            console.log("Payload gửi lên:", payload);

            // Gọi API để cập nhật trạng thái
            await trainApi.updateTrain(
                payload.id,
                payload.name,
                payload.description,
                payload.certificateId,
                payload.previousLevelId,
                payload.nextLevelId,
                payload.startTime,
                payload.endTime,
                payload.trainingListStatus
            );

            // Cập nhật trạng thái trong state
            setTrains((prevTrains) =>
                prevTrains.map((t) =>
                    t.id === train.id
                        ? { ...t, trainingListStatus: trainingListStatus.Finished } // Cập nhật trạng thái trong state
                        : t
                )
            );

            // Hiển thị thông báo thành công
            sweetAlert.alertSuccess(
                "Hoàn thành!",
                `Đào tạo đã được đánh dấu là hoàn thành.`,
                2000,
                false
            );
        } catch (err: unknown) {
            console.error("Lỗi khi hoàn thành đào tạo:", err);

            const error = err as AxiosError<{ message: string }>;
            sweetAlert.alertFailed(
                "Thất bại!",
                `Không thể hoàn thành đào tạo. ${error.response?.data?.message || "Đã xảy ra lỗi."
                }`,
                2000,
                false
            );
        }
    };


    const handleCreate = () => {
        navigate("/admin/create-training-lists");
    };

    // const handleEditTrainClick = (id: string): void => {
    //     if (catechists[id]?.length > 0) {
    //         sweetAlert.alertWarning(
    //             "Không thể chỉnh sửa!",
    //             "Danh sách đào tạo đã có Giáo lí viên, không thể chỉnh sửa.",
    //             2000,
    //             false
    //         );
    //         return; // Ngăn chặn điều hướng
    //     }
    //     navigate(`/admin/update-training-lists/${id}`);
    // };
    const handleEditTrainClick = (id: string): void => {
        navigate(`/admin/update-training-lists/${id}`);
    }

    const handleTrainingCatechistClick = () => {
        navigate(`/admin/training-catechist`);
    }

    const handleDeleteTrainClick = (id: string): void => {
        if (window.confirm("Bạn có chắc là muốn xóa đào tạo này không?")) {
            trainApi
                .deleteTrain(id)
                .then(() => {
                    sweetAlert.alertSuccess(
                        "Xóa thành công!",
                        `Train đã được xóa thành công.`,
                        2000,
                        false
                    );
                    setTrains(trains.filter((train) => train.id !== id));
                })
                .catch((err: Error) => {
                    console.error(`Không thể cập nhật train với ID: ${name}`, err);
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
                const train = trains.find(t => t.id === trainId);
                if (!train) return;

                const response = await trainApi.getCatechistsByTrainingListId(trainId);
                const items = response.data.data.items;

                const now = new Date();
                const startDate = new Date(train.startTime);

                // Nếu khóa chưa bắt đầu, chỉ đếm những catechist không có status = 2
                if (now < startDate) {
                    const activeItems = items.filter(
                        (item: any) => item.catechistInTrainingStatus !== 2
                    );
                    setCatechists(prev => ({
                        ...prev,
                        [trainId]: activeItems
                    }));
                } else {
                    // Nếu khóa đã bắt đầu hoặc kết thúc, đếm tất cả
                    setCatechists(prev => ({
                        ...prev,
                        [trainId]: items
                    }));
                }
            } catch (err) {
                console.error(`Failed to fetch catechists for train ID ${trainId}:`, err);
            }
        };

        trains.forEach(train => {
            fetchCatechistsForTrain(train.id);
        });
    }, [trains]);

    const handleAddOrUpdateCatechist = (trainId: string, catechistCount: number) => {
        const selectedTrain = trains.find(train => train.id === trainId);
        if (selectedTrain) {
            navigate('/admin/training-catechist', {
                state: {
                    trainingInfo: {
                        id: selectedTrain.id,
                        name: selectedTrain.name,
                        previousLevel: selectedTrain.previousLevel?.hierarchyLevel || levelMap[selectedTrain.previousLevelId],
                        nextLevel: selectedTrain.nextLevel?.hierarchyLevel || levelMap[selectedTrain.nextLevelId],
                        startTime: selectedTrain.startTime,
                        endTime: selectedTrain.endTime,
                        description: selectedTrain.description,
                        currentCatechistCount: catechistCount
                    }
                }
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
                            <th className="px-6 py-3">Hoàn thành</th>
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
                                                >
                                                    {train.name}
                                                </Link>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4 text-center">{train.description}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                                            {/* Kiểm tra nếu có hierarchyLevel từ previousLevel thì hiển thị, nếu không dùng fallback từ levelMap */}
                                            {train.previousLevel?.hierarchyLevel || levelMap[train.previousLevelId] || "Không xác định"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {/* Hiển thị hierarchyLevel hoặc tên của cấp tiếp theo */}
                                            {train.nextLevel?.hierarchyLevel || levelMap[train.nextLevelId] || "Không xác định"}
                                        </td>
                                        <td className="px-6 py-4 text-center">{formatDate(train.startTime)}</td>
                                        <td className="px-6 py-4 text-center">{formatDate(train.endTime)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {catechists[train.id]?.length || 0}
                                            {determineStatusLabel(train) === trainingListStatusLabel[trainingListStatus.NotStarted] && (
                                                <button
                                                    className="btn btn-primary ml-3"
                                                    onClick={() => handleAddOrUpdateCatechist(train.id, catechists[train.id]?.length || 0)}
                                                >
                                                    {catechists[train.id]?.length === 0 ? "Thêm" : "Cập nhật"}
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
                                        <td className="px-6 py-4 text-center">{renderActionCell(train)}</td>

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
