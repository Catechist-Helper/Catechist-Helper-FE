import React, { useState, useEffect } from "react";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { useFormik } from "formik";
import postsApi from "../../../api/Post";
import postCategoryApi from "../../../api/PostCategory";
import { useNavigate, Link } from "react-router-dom";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import CkEditor from "../../../components/ckeditor5/CkEditor";
import { PostStatus } from "../../../enums/Post";
import { PATH_ADMIN } from "../../../routes/paths";
import { getUserInfo } from "../../../utils/utils";

interface UserLogin {
  id: string;
  email: string;
}

const CreatePost: React.FC = () => {
  const [postCategories, setPostCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLogin, setUserLogin] = useState<UserLogin | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userLoggedin = getUserInfo();
        setUserLogin(userLoggedin);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    postCategoryApi
      .getAll(1, 5)
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items
        ) {
          setPostCategories(res.data.items);
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
      console.log({
        title: values.title,
        content: values.content,
        module: values.module,
        accountId: "",
        postCategoryId: values.postCategoryId,
      });

      try {
        if (!userLogin || !userLogin.id) {
          console.error("Không tìm thấy thông tin người dùng.");
          return;
        }

        const accountId = userLogin.id;
        const newPost = {
          title: values.title,
          content: values.content,
          module: values.module,
          accountId,
          postCategoryId: values.postCategoryId,
        };

        console.log("New Post: ", newPost);

        await postsApi.create(
          newPost.title,
          newPost.content,
          newPost.module,
          newPost.accountId,
          newPost.postCategoryId
        );

        navigate("/admin/post");
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
        <form
          onSubmit={formik.handleSubmit}
          className="w-full mx-auto px-20 mt-5"
        >
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
                <CkEditor
                  data={formik.values.content}
                  onChange={(data) => formik.setFieldValue("content", data)}
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label>Module</label>
            <select
              name="module"
              value={formik.values.module}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Chọn trạng thái</option>
              {Object.values(PostStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo bài viết"}
          </button>
          <Link
            to={PATH_ADMIN.post}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ml-5"
          >
            Quay lại
          </Link>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default CreatePost;
