import React, { useState } from "react";
import { useFormik } from "formik";
import trainApi from "../../../api/TrainingList";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import sweetAlert from "../../../utils/sweetAlert";
import { trainingListStatus } from "../../../enums/TrainingList";
const CreateTrain: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(-1);
    };

    const formik = useFormik({
        initialValues: {
            previousLevel: "",
            nextLevel: "",
            startTime: "",
            endTime: "",
            trainingListStatus: trainingListStatus.START,
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const response = await trainApi.createTrain(
                    values.previousLevel,
                    values.nextLevel,
                    values.startTime,
                    values.endTime,
                    values.trainingListStatus,
                );
        
                sweetAlert.alertSuccess(
                    "Tạo thành công!",
                    "Cấp bậc đã được tạo thành công.",
                    2000,  
                    false  
                );
                console.log("Response: ", response);
                setTimeout(() => {
                    window.location.reload();  
                }, 2000);  
                               
            } catch (error) {
                sweetAlert.alertFailed(
                    "Thất bại!",
                    "Không thể tạo cấp bậc.",
                    3000,
                    true
                );
                console.error("Error: ", error);
            } finally {
                setIsSubmitting(false);
            }
        
        },
    });

    return (
        <AdminTemplate>
            <div>
                <h3 className="text-center pt-10 fw-bold">TẠO DANH SÁCH ĐÀO TẠO</h3>
                <form onSubmit={formik.handleSubmit} className="max-w-sm mx-auto mt-5">
                    <div className="mb-5">
                        <label
                            htmlFor="previousLevel"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Bậc cấp trước
                        </label>
                        <input
                            id="previousLevel"
                            name="previousLevel"
                            type="text"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={formik.handleChange}
                            value={formik.values.previousLevel}
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="nextLevel"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Bậc cấp tiếp theo
                        </label>
                        <input
                            id="nextLevel"
                            name="nextLevel"
                            type="text"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={formik.handleChange}
                            value={formik.values.nextLevel}
                        />
                    </div>
                    <div className="mb-5">
                        <h2 className="text-xl text-gray-900 dark:text-white font-bold mb-2">Thời gian bắt đầu</h2>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd" />
                                </svg>
                                <input
                                    id="startTime"
                                    name="startTime"
                                    type="datetime-local"
                                    className="text-gray-900 dark:text-white text-base font-medium block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    onChange={formik.handleChange}
                                    value={formik.values.startTime}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-5">
                        <h2 className="text-xl text-gray-900 dark:text-white font-bold mb-2">Thời gian kết thúc</h2>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-gray-400 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clipRule="evenodd" />
                                </svg>
                                <input
                                    id="endTime"
                                    name="endTime"
                                    type="datetime-local"
                                    className="text-gray-900 dark:text-white text-base font-medium block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    onChange={formik.handleChange}
                                    value={formik.values.endTime}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-5">
                        <label className="block mb-1 text-sm font-medium">Trạng thái</label>
                        <div className="flex items-center">
                            <div className="flex items-center mr-4">
                                <input
                                    type="radio"
                                    name="trainingListStatus"
                                    value={trainingListStatus.START}
                                    checked={formik.values.trainingListStatus === trainingListStatus.START}
                                    onChange={() => formik.setFieldValue('trainingListStatus', trainingListStatus.START)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <label className="ml-2">Đào tạo</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start mb-5">
                        <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            disabled={isSubmitting}
                            onClick={handleGoBack}
                        >
                            {isSubmitting ? "Đang tạo" : "Tạo cấp bậc"}
                        </button>
                        <Link
                            to={PATH_ADMIN.training_lists}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-5"
                        >
                            Quay lại
                        </Link>
                    </div>
                </form>
            </div>
        </AdminTemplate>
    );
};

export default CreateTrain;
