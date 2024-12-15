import React, { useState } from "react";
import { useFormik } from "formik";
import postCategoryApi from "../../../api/PostCategory";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
import sweetAlert from "../../../utils/sweetAlert";

const CreatePostCategory: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validate: (values: { name: string; description: string }) => {
      const errors: { name?: string } = {};
      // Kiểm tra nếu name trống
      if (!values.name.trim()) {
        errors.name = "Tên danh mục là bắt buộc";
      }
      // Description không cần kiểm tra vì là field không bắt buộc
      return errors;
    },
    onSubmit: async (values) => {
      if (!values.name.trim()) {
        return; // Không cho submit nếu name trống
      }
      setIsSubmitting(true);
      try {
        const response = await postCategoryApi.create(
          values.name,
          values.description
        );

        console.log("Response: ", response);
        navigate(PATH_ADMIN.post_category);
        setTimeout(() => {
          sweetAlert.alertSuccess(
            "Tạo thành công!",
            "Tạo danh mục tin tức thành công!",
            3000,
            false
          );
        });
      } catch (error) {
        sweetAlert.alertFailed(
          "Thất bại!",
          "Không thể tạo danh mục. Vui lòng thử lại.",
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
        <h3 className="text-center pt-10 fw-bold">TẠO DANH MỤC BÀI VIẾT</h3>
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto mt-5">
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
              className={`bg-gray-50 border ${
                formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-gray-300"
              } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.name}</p>
            )}
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
          <div className="flex items-start mb-5">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
              disabled={isSubmitting || !formik.values.name.trim()}
            >
              {isSubmitting ? "Đang tạo" : "Tạo danh mục bài viết"}
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

export default CreatePostCategory;
