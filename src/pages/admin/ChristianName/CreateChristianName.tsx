import React, { useState } from "react";
import { useFormik } from "formik";
import { message } from "antd";
import christianNamesApi from "../../../api/ChristianName";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";

const CreatePostCategory: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      gender: "",
      holyDay: "",
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await christianNamesApi.createChristianNames(
          values.name,
          values.gender,
          values.holyDay
        );

        message.success("Tạo tên Thánh thành công!");
        console.log("Response: ", response);
      } catch (error) {
        message.error("Tạo tên Thánh không thành công");
        console.error("Error: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">TẠO TÊN THÁNH</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </div>
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">Giới tính</label>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={formik.values.gender === "Nam"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Nam</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={formik.values.gender === "Nữ"}
                  onChange={formik.handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2">Nữ</label>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label
              htmlFor="holyDay"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Ngày thánh
            </label>
            <input
              id="holyDay"
              name="holyDay"
              type="datetime-local"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
              onChange={formik.handleChange}
              value={formik.values.holyDay}
            />
          </div>

          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              disabled={isSubmitting}
              onClick={handleGoBack}
            >
              {isSubmitting ? "Đang tạo" : "Tạo tên thánh"}
            </button>
            <Link
              to={PATH_ADMIN.christian_name}
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

export default CreatePostCategory;
