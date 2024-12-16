import React, { useState } from "react";
import { useFormik } from "formik";
import { message } from "antd";
import systemConfigApi from "../../../api/SystemConfiguration";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";

const CreateConfig: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  const formik = useFormik({
    initialValues: {
      key: "",
      value: "",
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await systemConfigApi.createConfig(
          values.key,
          values.value
        );
        message.success("Cấu hình tạo thành công!");
        console.log("Response: ", response);
      } catch (error) {
        message.error("Không tạo được cấu hình.");
        console.error("Error: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">TẠO CẤU HÌNH</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="key"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Key
            </label>
            <input
              id="key"
              name="key"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.key}
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="value"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Value
            </label>
            <input
              id="value"
              name="value"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.value}
            />
          </div>
          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
              disabled={isSubmitting}
              onClick={handleGoBack}
            >
              {isSubmitting ? "Đang tạo" : "Tạo danh mục bài viết"}
            </button>
            <Link
              to={PATH_ADMIN.system_configurations}
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

export default CreateConfig;
