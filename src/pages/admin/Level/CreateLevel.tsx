import React, { useState } from "react";
import { useFormik } from "formik";
import levelApi from "../../../api/Level";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import sweetAlert from "../../../utils/sweetAlert";

const CreateLevel: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate(); 
    const handleGoBack = () => {
        navigate(-1); 
    };
    
    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            catechismLevel: 0
        },
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const response = await levelApi.createLevel(
                    values.name,
                    values.description,
                    values.catechismLevel
                );
                
               
                sweetAlert.alertSuccess(
                    "Tạo thành công!",
                    "Cấp bậc đã được tạo thành công.",
                    3000, 
                    16 
                );
                console.log("Response: ", response);
                setTimeout(() => {
                    window.location.reload();  
                }, 2000); 
                navigate("/admin/levels", { replace: true });
            } catch (error) {
                
                sweetAlert.alertFailed(
                    "Thất bại!",
                    "Không thể tạo cấp bậc.",
                    3000, 
                    16
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
                <h3 className="text-center pt-10 fw-bold">TẠO CẤP BẬC</h3>
                <form onSubmit={formik.handleSubmit} className="max-w-sm mx-auto mt-5">
                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Tên
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={formik.handleChange}
                            value={formik.values.name}
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="description"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Mô tả
                        </label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={formik.handleChange}
                            value={formik.values.description}
                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="catechismLevel"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Cấp độ giáo lý
                        </label>
                        <input
                            id="catechismLevel"
                            name="catechismLevel"
                            type="number"
                            min="0"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={formik.handleChange}
                            value={formik.values.catechismLevel}
                        />
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
                            to={PATH_ADMIN.post_category}
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

export default CreateLevel;