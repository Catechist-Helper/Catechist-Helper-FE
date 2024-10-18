import React, { useState, useEffect } from "react";
import systemConfigApi from "../../../api/SystemConfiguration";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";

const ListAllConfig: React.FC = () => {
    const [systemConfig, setSystemConfig] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        systemConfigApi
            .getAllConfig(1, 10)
            .then((axiosRes: AxiosResponse) => {
                const res: BasicResponse = axiosRes.data;
                console.log("Response data: ", res);

                if (
                    res.statusCode.toString().trim().startsWith("2") &&
                    res.data.items != null
                ) {
                    console.log("Items: ", res.data.items);
                    setSystemConfig(res.data.items);
                } else {
                    console.log("No items found");
                }
            })
            .catch((err) => {
                console.error("Không thấy cấu hình hệ thống : ", err);
            });
    }, []);

    const handleCreate = () => {
        navigate("/admin/create-system-configurations");
    };

    const handleEditCategoryClick = (id: string): void => {
        navigate(`/admin/update-system-configurations/${id}`);
    };

    const handleDeleteCategoryClick = (id: string): void => {
        if (window.confirm("Bạn có chắc là muốn xóa cấu hình này không?")) {
            systemConfigApi
                .deleteConfig(id)
                .then(() => {
                    alert(`SystemConfig with ID: ${id} đã xóa thành công.`);
                    window.location.reload();
                })
                .catch((err: Error) => {
                    console.error(`Failed to delete systemConfig with ID: ${id}`, err);
                });
        }
    };

    return (
        <>
            <div className="container mt-0">
                <div className="mb-3 text-center fw-bold">
                    <h1>CẤU HÌNH HỆ THỐNG</h1>
                </div>
                <div className="d-flex align-items-center mb-3 justify-center">
                    <button
                        className="mt-2 px-4 py-2 border border-black text-black bg-white hover:bg-gray-200"
                        onClick={handleCreate}
                    >
                        Tạo cấu hình
                    </button>
                </div>

                <div className="flex relative overflow-x-auto justify-center p-6">
                    <table className="min-w-[900px] text-sm text-center text-gray-500 table-auto border-collapse">
                        <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
                            <tr>
                                <th scope="col" className="px-4 py-3">Key</th>
                                <th scope="col" className="px-4 py-3">Value</th>
                                <th scope="col" className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {systemConfig.length > 0 ? (
                                systemConfig.map((system: any) => (
                                    <tr
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        key={system.id}
                                    >
                                        <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {system.key}
                                        </td>
                                        <td className="px-4 py-4">
                                            {system.value}
                                        </td>
                                        <td className="px-4 py-4 space-x-2">
                                            <button
                                                onClick={() => handleEditCategoryClick(system.id)}
                                                className="btn btn-info"
                                            >
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategoryClick(system.id)}
                                                className="btn btn-warning"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center">
                                        Không thấy danh sách cấu hình
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
};

export default ListAllConfig;
