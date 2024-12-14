import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate, Link } from "react-router-dom";
import postCategoryApi from "../../../api/PostCategory";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
const UpdatePostCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await postCategoryApi.update(
          id!,
          values.name,
          values.description
        );
        console.log("Update successful: ", response);
        console.log("Update successful: ", response);
        navigate(PATH_ADMIN.post_category);  
        setTimeout(() => {                  
          alert("Cập nhật danh mục thành công!");
        }, 100);
      } catch (error) {
        console.error("Update failed: ", error);
        alert("Cập nhật danh mục thất bại!");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (!id) {
          throw new Error("ID is undefined");
        }

        const response = await postCategoryApi.getById(id);
        const category = response.data;

        formik.setValues({
          name: category.data.name,
          description: category.data.description,
        });

        console.log("Updated Formik values:", formik.values);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      }
    };

    fetchCategory();
  }, [id]);

  return (
    <AdminTemplate>
      <div>
        <h3 className="text-center pt-10 fw-bold">
          CẬP NHẬT DANH MỤC BÀI VIẾT
        </h3>
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
              className={`bg-gray-50 border ${formik.touched.name && formik.errors.name
                  ? 'border-red-500'
                  : 'border-gray-300'
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật danh mục tin"}
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

export default UpdatePostCategory;
