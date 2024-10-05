import React, { useState, useEffect } from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useFormik } from "formik";
import postsApi from "../../../api/Post";
import postCategoryApi from "../../../api/PostCategory";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import CkEditor from "../../../components/ckeditor5/CkEditor";

const CreatePost: React.FC = () => {
  const [postCategories, setPostCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    postCategoryApi
      .getAll(1, 5)
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        console.log("Response data: ", res);

        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          console.log("Items: ", res.data.items);
          setPostCategories(res.data.items);
        } else {
          console.log("No items found");
        }
      })
      .catch((err) => {
        console.error("Không thấy danh mục : ", err);
      });
  }, []);

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      module: "",
      postCategoryId: "",
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const accountId = "id_user";
        const newPost = {
          title: values.title,
          content: values.content,
          module: values.module,
          accountId,
          postCategoryId: values.postCategoryId,
        };
        await postsApi.create(
          values.title,
          values.content,
          values.module,
          accountId,
          values.postCategoryId
        );
        navigate("/posts");
      } catch (error) {
        console.error("Không thể tạo bài viết", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AdminTemplate>
      <div>
        <h2 className="text-center">Tạo bài viết mới</h2>
        <form onSubmit={formik.handleSubmit} className="max-w-sm mx-auto mt-5">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="content"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Nội dung
            </label>
            <div className="p-0">
              <div className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
                <CkEditor />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label>Module</label>
            <input
              type="text"
              name="module"
              value={formik.values.module}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Danh mục bài viết
            </label>
            <select
              name="postCategoryId"
              value={formik.values.postCategoryId}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Chọn danh mục</option>
              {postCategories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo bài viết"}
          </button>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default CreatePost;
