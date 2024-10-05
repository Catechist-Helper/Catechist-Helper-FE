import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineCalendar } from "react-icons/ai";
import postCategoryApi from "../../../api/PostCategory";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import postsApi from "../../../api/Post";
import { useNavigate } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
const HomePost: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [postCategories, setPostCategories] = useState([]);
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedDate(e.target.value);
  const [post, setPost] = useState([]);
  const navigate = useNavigate();
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

  // const handleCreate = () => {
  //     navigate("/admin/create-post-category");
  // };

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
  return (
    <>
      <AdminTemplate>
        <div className="flex items-center justify-end space-x-4 p-5">
          <div className="d-flex">
            {postCategories.map((category: any) => (
              <button
                key={category.id}
                className="btn btn-outline-primary mx-2"
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
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full"
            onClick={handleCreatePost}
          >
            Tạo bài mới
          </button>
        </div>

        <div className="flex relative overflow-x-auto justify-center p-6">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-white uppercase bg-[#70492A] h-20">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Tiêu đề
                </th>
                <th scope="col" className="px-6 py-3">
                  Nội dung
                </th>
                <th scope="col" className="px-6 py-3">
                  Module
                </th>
                <th scope="col" className="px-6 py-3">
                  Người đăng
                </th>
                <th scope="col" className="px-6 py-3">
                  Danh mục
                </th>
              </tr>
            </thead>
            <tbody>
              {post && post.length > 0 ? (
                post.map((isPost: any) => (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={isPost.id}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {isPost.title}
                    </th>
                    <td className="px-6 py-4">{isPost.content}</td>
                    <td className="px-6 py-4">{isPost.module}</td>
                    <td className="px-6 py-4">{isPost.accountId}</td>
                    <td className="px-6 py-4">{isPost.postCategoryId}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Không thấy danh sách danh mục</td>
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
