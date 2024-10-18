import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineCalendar } from "react-icons/ai";
import postCategoryApi from "../../../api/PostCategory";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import postsApi from "../../../api/Post";
import { useNavigate, Link } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";



const HomePost: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]);
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedDate(e.target.value);
  const [post, setPost] = useState([]);
  const navigate = useNavigate();

  type PostCategory = {
    id: string;
    name: string;
  };


  useEffect(() => {
    postsApi
      .getAll(1, 5)
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        console.log("Response data: ", res);

        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          console.log("Items: ", res.data.items);
          setPost(res.data.items);
        } else {
          console.log("No items found");
        }
      })
      .catch((err) => {
        console.error("Không thấy danh mục : ", err);
      });
  }, []);

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

  const handleCreatePost = () => {
    navigate("/admin/create-post");
  };

  const handleDeletePostClick = (id: string): void => {
    if (window.confirm("Bạn có chắc là muốn xóa bài này không?")) {
      postsApi
        .deletePosts(id)
        .then(() => {
          console.log(`Post with ID: ${id} đã xóa thành công.`);
          window.location.reload();
        })
        .catch((err: Error) => {
          console.error(`Failed to delete post with ID: ${id}`, err);
        });
    }
  };

  const handleEditPostClick = (id: string): void => {
    navigate(`/admin/update-post/${id}`);
  };

  return (
    <>
      <AdminTemplate>
        <div className="mb-10 text-center fw-bold mb-50">
          <h1>BẢNG TIN</h1>
        </div>
        <div className="flex items-center justify-end space-x-4 p-5">

          <div className="d-flex">
            {postCategories.map((category: any) => (
              <button
                key={category.id}
                className="btn btn-outline-primary mx-2 px-4 py-2 border border-black text-black bg-white hover:bg-gray-200"
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-4 pr-10 py-2 rounded-lg bg-gray-100 border focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <AiOutlineSearch
              className="absolute right-3 top-2.5 text-gray-500"
              size={20}
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-4 pr-10 py-2 rounded-lg bg-gray-100 border focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <AiOutlineCalendar
              className="absolute right-3 top-2.5 text-gray-500"
              size={20}
            />
          </div>

          <button
            className="bg-white text-black px-4 py-2 border border-black hover:bg-gray-200 hover:text-blue-600 transition-colors duration-200 !important"
            onClick={handleCreatePost}
          >
            Tạo bài mới
          </button>




        </div>
        
        <div className="flex relative overflow-x-auto justify-center p-6">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
              <tr>
                <th scope="col" className="px-6 py-3">Tiêu đề</th>
                <th scope="col" className="px-6 py-3">Nội dung</th>
                <th scope="col" className="px-6 py-3">Module</th>
                {/* <th scope="col" className="px-6 py-3">Người đăng</th> */}
                <th scope="col" className="px-6 py-3">Danh mục</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {post && post.length > 0 ? (
                post.map((isPost: any) => {
                  const category = postCategories.find(
                    (category: any) => category.id === isPost.postCategoryId
                  );

                  return (
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={isPost.id}>
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <Link className="text-dark" to={`/admin/post-detail/${isPost.id}`}>
                          {isPost.title}
                        </Link>
                      </th>
                      <td className="px-4 py-4 space-x-2">
                        {isPost.content.replace(/<[^>]*>/g, '').split(" ").slice(0, 10).join(" ")}...
                      </td>

                      <td className="px-6 py-4">{isPost.module}</td>
                      <td className="px-6 py-4">{category ? category.name : 'Không có danh mục'}</td>
                      <td>
                        <button onClick={() => handleEditPostClick(isPost.id)} className="btn btn-info">
                          Chỉnh sửa

                        </button>
                        <button onClick={() => handleDeletePostClick(isPost.id)} className="btn btn-warning">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>Không thấy danh sách bài viết</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </AdminTemplate>
    </>
  );
};

export default HomePost;
