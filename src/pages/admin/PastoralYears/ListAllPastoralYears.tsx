import React, { useState, useEffect } from "react";
import pastoralYearsApi from "../../../api/PastoralYear"; 
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import { pastoralYearStatus } from "../../../enums/PastoralYear";

interface PastoralYear {
    id: string;
    name: string;
    note: string;
    pastoralYearStatus: number; 
}

const ListAllPastoralYears: React.FC = () => {
    const [pastoralYears, setPastoralYears] = useState<PastoralYear[]>([]);
    const navigate = useNavigate();

    
    useEffect(() => {
        pastoralYearsApi
            .getAllPastoralYears(1, 10) 
            .then((axiosRes: AxiosResponse) => {
                const res: BasicResponse = axiosRes.data;
                console.log("Response data: ", res);

                if (
                    res.statusCode.toString().trim().startsWith("2") &&
                    res.data.items != null
                ) {
                    console.log("Items: ", res.data.items);
                    setPastoralYears(res.data.items);
                } else {
                    console.log("No items found");
                }
            })
            .catch((err) => {
                console.error("Không thể lấy danh sách niên khóa: ", err);
            });
    }, []);

    const handleToggleChange = (year: PastoralYear) => {
        const newStatus = year.pastoralYearStatus === pastoralYearStatus.START
            ? pastoralYearStatus.FINISH
            : pastoralYearStatus.START;

        pastoralYearsApi.updatePastoralYears(
            year.id,           
            year.name,         
            year.note,          
            newStatus           
        )
            .then(() => {
                setPastoralYears(prevYears =>
                    prevYears.map(y =>
                        y.id === year.id ? { ...y, pastoralYearStatus: newStatus } : y
                    )
                );
            })
            .catch(err => {
                console.error("Không thể cập nhật trạng thái niên khóa: ", err);
            });
    };

    const handleCreate = () => {
        navigate("/admin/create-pastoral-years");
    };
    const handleEditPastoralYearClick = (id: string): void => {
        navigate(`/admin/update-pastoral-years/${id}`);
    };

    const handleDeletePastoralYearClick = (id: string): void => {
        if (window.confirm("Bạn có chắc là muốn xóa niên khóa này không?")) {
            pastoralYearsApi
                .deletePastoralYears(id)
                .then(() => {
                    console.log(`Năm niên khóa đã xóa thành công.`);
                    setPastoralYears(prevYears => prevYears.filter(y => y.id !== id));
                })
                .catch((err: Error) => {
                    console.error(`Không thể xóa niên khóa với ID: ${id}`, err);
                });
        }
    };

    return (
        <div className="container mt-5">
            <div className="mb-10 text-center fw-bold">
                <h1>DANH SÁCH NIÊN KHÓA</h1>
            </div>
            <div className="d-flex align-items-center mb-3">
                <div className="ml-6">
                    <button className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200" onClick={handleCreate}>
                        Tạo niên khóa
                    </button>
                </div>
            </div>

            <div className="flex relative overflow-x-auto justify-center p-6">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
                        <tr>
                            <th scope="col" className="px-6 py-3">Niên Khóa</th>
                            <th scope="col" className="px-6 py-3">Ghi chú</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastoralYears.length > 0 ? (
                            pastoralYears.map((year) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={year.id}>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="text-dark">{year.name}</div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <div className="text-dark">{year.note}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2"> 
                                                {year.pastoralYearStatus === pastoralYearStatus.START ? "Bắt đầu" : "Kết thúc"}
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={year.pastoralYearStatus === pastoralYearStatus.START}
                                                onChange={() => handleToggleChange(year)} 
                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>

                                    <td className="px-4 py-4 space-x-2">
                                        <button
                                            onClick={() => handleEditPastoralYearClick(year.id)}
                                            className="btn btn-info"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeletePastoralYearClick(year.id)}
                                            className="btn btn-warning"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center">Không tìm thấy niên khóa</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListAllPastoralYears;
