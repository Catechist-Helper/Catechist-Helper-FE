import React, { useState, useEffect } from "react";
import trainApi from "../../../api/TrainingList";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import { trainingListStatus } from "../../../enums/TrainingList";
import sweetAlert from "../../../utils/sweetAlert";
interface TrainingLists {
    id: string;
    previousLevel: string;
    nextLevel: string;
    startTime: string;
    endTime: string;
    trainingListStatus: number;
}

const ListAllTrain: React.FC = () => {
    const [trains, setTrains] = useState<TrainingLists[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        trainApi
            .getAllTrain()
            .then((axiosRes: AxiosResponse) => {
                const res: BasicResponse = axiosRes.data;
                console.log("Response data: ", res);

                if (
                    res.statusCode.toString().trim().startsWith("2") &&
                    res.data.items != null
                ) {
                    console.log("Items: ", res.data.items);
                    setTrains(res.data.items);
                } else {
                    console.log("No items found");
                }
            })
            .catch((err) => {
                console.error("Không thấy danh sách đào tạo: ", err);
            });
    }, []);

    const handleToggleChange = (train: TrainingLists) => {
        const newStatus = train.trainingListStatus === trainingListStatus.START
            ? trainingListStatus.FINISH
            : trainingListStatus.START;

        trainApi.updateTrain(
            train.id,
            train.previousLevel,
            train.nextLevel,
            train.startTime,
            train.endTime,
            newStatus
        )
            .then(() => {
                setTrains(prevTrains =>
                    prevTrains.map(t =>
                        t.id === train.id ? { ...t, trainingListStatus: newStatus } : t
                    )
                );
            })
            .catch(err => {
                console.error("Không thể cập nhật trạng thái đào tạo: ", err);
            });
    };


    const handleCreate = () => {
        navigate("/admin/create-training-lists");
    };

    const handleEditTrainClick = (id: string): void => {
        navigate(`/admin/update-training-lists/${id}`);
    };

    const handleDeleteTrainClick = (id: string): void => {
        if (window.confirm("Bạn có chắc là muốn xóa đào tạo này không?")) {
            trainApi
                .deleteTrain(id)
                .then(() => {
                    sweetAlert.alertSuccess(
                        "Xóa thành công!",
                        `Train với ID: ${id} đã được xóa thành công.`,
                        2000, 
                        false
                    );   
                   console.log(`Train với ID: ${id} đã được cập nhật thành isDeleted: false.`);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000); 
                })
                .catch((err: Error) => {
                    console.error(`Không thể cập nhật train với ID: ${id}`, err);
                });
        }
    };
       
    return (
        <>
            <div className="container mt-5 ">
                <div className="mb-10 text-center fw-bold">
                    <h1>DANH SÁCH ĐÀO TẠO</h1>
                </div>
                <div className="d-flex align-items-center mb-3 ">
                    <div className="ml-6">
                        <button className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200" onClick={handleCreate}>
                            Tạo danh sách
                        </button>
                    </div>
                </div>

                <div className="flex relative overflow-x-auto justify-center p-6">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
                            <tr>
                                <th scope="col" className="px-6 py-3">Cấp bậc trước</th>
                                <th scope="col" className="px-6 py-3">Bậc cấp tiếp theo</th>
                                <th scope="col" className="px-6 py-3">Ngày bắt đầu</th>
                                <th scope="col" className="px-6 py-3">Ngày kết thúc</th>
                                <th scope="col" className="px-6 py-3">Trạng thái</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trains.length > 0 ? (
                                trains
                                    .filter((train: any) => !train.isDeleted)  
                                    .map((train: any) => (
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={train.id}>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <div className="text-dark">{train.previousLevel}</div>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="text-dark text-decoration-none">{train.nextLevel}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-dark text-decoration-none">{train.startTime}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-dark text-decoration-none">{train.endTime}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2">
                                                        {train.trainingListStatus === trainingListStatus.START ? "Đào tạo" : "Kết thúc"}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={train.trainingListStatus === trainingListStatus.START}
                                                        onChange={() => handleToggleChange(train)}
                                                    />
                                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </td>
                                            <td className="px-4 py-4 space-x-2">
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
                                    <td colSpan={3} className="px-6 py-4 text-center">Không thấy danh sách đào tạo</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
};

export default ListAllTrain;
