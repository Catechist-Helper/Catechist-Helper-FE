import React, { useState, useEffect } from "react";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import postsApi from "../../../api/Post";
import postCategoryApi from "../../../api/PostCategory";
import { useParams } from "react-router-dom";

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
    <div className="container mx-auto p-5">
      {post && (
        <>
          <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="text-sm text-gray-500">
            <p>Module: {post.module}</p>
            <p>Người đăng: {post.accountId}</p>
            <p>Danh mục: {categoryName}</p> 
          </div>
        </>
      )}
    </div>
  );
};

export default PostDetails;
