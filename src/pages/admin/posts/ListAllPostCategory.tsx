import React, { useState, useEffect } from "react";
import postCategoryApi from "../../../api/PostCategory";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import postsApi from "../../../api/Post";
const ListAllPostCategory: React.FC = () => {
  const [postCategories, setPostCategories] = useState([]);
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

  const handleCreate = () => {
    navigate("/admin/create-post-category");
  };

  const handleEditCategoryClick = async (id: string): Promise<void> => {
    try {
      // Kiểm tra xem danh mục có đang được sử dụng không
      const postsResponse = await postsApi.getAll(1, 999);
      const posts = postsResponse.data.data.items;
      const isCategoryInUse = posts.some((post: any) => post.postCategoryId === id);
  
      if (isCategoryInUse) {
        alert("Danh mục này đang được sử dụng trong bài viết. Không thể chỉnh sửa!");
        return;
      }
  
      // Nếu không được sử dụng thì mới cho phép chuyển đến trang edit
      navigate(`/admin/update-post-category/${id}`);
    } catch (err) {
      console.error(`Lỗi khi kiểm tra danh mục có ID: ${id}`, err);
      alert("Có lỗi xảy ra khi kiểm tra danh mục!");
    }
  };

  const handleDeleteCategoryClick = async (id: string): Promise<void> => {
    try {
      // Trước tiên lấy tất cả bài post để kiểm tra
      const postsResponse = await postsApi.getAll(1, 100); 
      const posts = postsResponse.data.data.items;
      
      // Kiểm tra xem có bài post nào đang sử dụng category này không
      const isPostUsingCategory = posts.some((post: any) => post.postCategoryId === id);
  
      if (isPostUsingCategory) {
        alert("Không thể xóa danh mục này vì đang được sử dụng trong bài viết!");
        return;
      }
  
      // Nếu không có bài post nào sử dụng, tiến hành xóa
      if (window.confirm("Bạn có chắc là muốn xóa danh mục này không?")) {
        await postCategoryApi.deleteCategory(id);
        alert(`Xóa danh mục thành công.`);
        window.location.reload();
      }
    } catch (err) {
      console.error(`Lỗi khi xóa danh mục có ID: ${id}`, err);
      alert("Xóa danh mục thất bại!");
    }
  };

  console.log(ListAllPostCategory);
  return (
    <>
      <div className="container mt-5 ">
        <div className="mb-10 text-center fw-bold">
          <h1>DANH MỤC ĐĂNG TIN</h1>
        </div>
        <div className="d-flex align-items-center mb-3 ">
          <div className="ml-6">
            <button className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200" onClick={handleCreate}>
              Tạo danh mục
            </button>
          </div>
        </div>

        <div className="flex relative overflow-x-auto justify-center p-6">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
              <tr>
                <th scope="col" className="px-6 py-3">Tên</th>
                <th scope="col" className="px-6 py-3">Mô tả</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {postCategories.length > 0 ? (
                postCategories.map((category: any) => (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={category.id}>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <div className="text-dark">{category.name}</div>
                    </th>
                    <td className="px-6 py-4">
                      <div className="text-dark text-decoration-none">{category.description}</div>
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        onClick={() => handleEditCategoryClick(category.id)}
                        className="btn btn-info"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(category.id)}
                        className="btn btn-warning"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">Không thấy danh sách danh mục</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};

export default ListAllPostCategory;
