import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import postsApi from "../../../api/Post";
import postCategoryApi from "../../../api/PostCategory";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import CkEditor from "../../../components/ckeditor5/CkEditor";
import { PostStatus } from "../../../enums/Post";
import { PATH_ADMIN } from "../../../routes/paths";
import { getUserInfo } from "../../../utils/utils";

const UpdatePost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState<UserLogin | null>(null);
  interface UserLogin {
    id: string;
    email: string;
  }

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

  type PostCategory = {
    id: string;
    name: string;
  };

  const mapApiModuleToEnum = (module: string): string => {
    switch (module) {
      case "PUBLIC":
        return PostStatus.PUBLIC;
      case "PRIVATE":
        return PostStatus.PRIVATE;
      default:
        return "";
    }
  };
  useEffect(() => {
    postsApi
      .getById(id!)
      .then((res) => {
        const post = res.data.data;
        formik.setValues({
          title: post.title,
          content: post.content,
          module: mapApiModuleToEnum(post.module),
          postCategoryId: post.postCategoryId,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch post details", err);
      });

    postCategoryApi
      .getAll(1, 100)
      .then((res) => {
        setPostCategories(res.data.data.items);
      })
      .catch((err) => {
        console.error("Failed to fetch post categories", err);
      });
  }, [id]);

  const mapEnumToApiModule = (status: string): string => {
    switch (status) {
      case PostStatus.PUBLIC:
        return "PUBLIC";
      case PostStatus.PRIVATE:
        return "PRIVATE";
      default:
        return "";
    }
  };

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
        if (!userLogin || !userLogin.id) {
          console.error("Không tìm thấy thông tin người dùng.");
          return;
        }

        const accountId = userLogin.id;
        const updatedPost = {
          title: values.title,
          content: values.content,
          module: mapEnumToApiModule(values.module),
          accountId,
          postCategoryId: values.postCategoryId,
        };

        const response = await postsApi.update(
          id!,
          updatedPost.title,
          updatedPost.content,
          updatedPost.module,
          updatedPost.accountId,
          updatedPost.postCategoryId
        );

        console.log("Update successful: ", response);
        navigate("/admin/post");
      } catch (error) {
        console.error("Failed to update post: ", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AdminTemplate>
      <div>
        <h2 className="text-center text-[2rem] font-bold">
          Chỉnh sửa bài viết
        </h2>
        <form
          onSubmit={formik.handleSubmit}
          className="w-full px-20 mx-auto mt-5"
        >
          <div className="mb-5">
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="content"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Nội dung
            </label>
            <CkEditor
              data={formik.values.content}
              onChange={(data) => formik.setFieldValue("content", data)}
            />
          </div>

          <div className="mb-5">
            <label>Trạng thái</label>
            <select
              name="module"
              value={formik.values.module}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            >
              <option value="" disabled>
                Chọn trạng thái
              </option>
              {Object.values(PostStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label
              htmlFor="postCategoryId"
              className="block mb-2 text-sm font-medium text-gray-900 "
            >
              Danh mục tin
            </label>
            <select
              name="postCategoryId"
              value={formik.values.postCategoryId}
              onChange={formik.handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            >
              <option value="" disabled>
                Lựa chọn danh mục
              </option>
              {postCategories.map((category) => (
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
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật tin"}
          </button>
          <Link
            to={PATH_ADMIN.post}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-[14px] text-center ml-5"
          >
            Quay lại
          </Link>
        </form>
      </div>
    </AdminTemplate>
  );
};

export default UpdatePost;
