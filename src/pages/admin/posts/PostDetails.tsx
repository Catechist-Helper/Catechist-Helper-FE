import React, { useState, useEffect } from "react";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import postsApi from "../../../api/Post";
import accountApi from "../../../api/Account";
import postCategoryApi from "../../../api/PostCategory";
import { useParams, Link } from "react-router-dom";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { PATH_ADMIN } from "../../../routes/paths";
interface Post {
  id: string;
  title: string;
  content: string;
  module: string;
  accountId: string;
  postCategoryId: string;
}

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null); 
  useEffect(() => {
    const fetchPostAndCategory = async () => {
      try {
        const response: AxiosResponse<BasicResponse> = await postsApi.getById(id!);
        const res = response.data;

        if (res.statusCode.toString().startsWith("2") && res.data) {
          setPost(res.data);


          const categoryResponse: AxiosResponse<BasicResponse> = await postCategoryApi.getById(res.data.postCategoryId);
          const categoryRes = categoryResponse.data;

          if (categoryRes.statusCode.toString().startsWith("2") && categoryRes.data) {
            setCategoryName(categoryRes.data.name); // Set the category name
          } else {
            setCategoryName("Không tìm thấy danh mục");
          }
          try {
            const accountResponse: AxiosResponse<BasicResponse> = await accountApi.getAccountById(res.data.accountId);
            const accountRes = accountResponse.data;

            if (accountRes.statusCode.toString().startsWith("2") && accountRes.data) {
              setAccountName(accountRes.data.fullName);
            } else {
              setAccountName("Không tìm thấy người dùng");
            }
          } catch (accountErr) {
            console.error("Error fetching account:", accountErr);
            setAccountName("Không tìm thấy người dùng");
          }
        } else {
          setError("Không tìm thấy bài viết.");
        }
      } catch (err) {
        setError("Không thể tải bài viết.");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostAndCategory();
    }
  }, [id]);

  if (loading) {
    return <p>Đang tải...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <AdminTemplate>
      <div className="container mx-auto p-5">
        {post && (
          <>
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            <div className="text-sm text-gray-500">
              <p>Module: {post.module}</p>
              <p>Người đăng: {accountName || "Đang tải..."}</p>
              <p>Danh mục: {categoryName}</p>
            </div>
            <Link
              to={PATH_ADMIN.post}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit px-5 py-2.5 text-center flex justify-center items-center mx-auto"
            >
              Quay lại
            </Link>


          </>
        )}
      </div>
    </AdminTemplate>
  );
};

export default PostDetails;
