import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import postsApi from "../../../../api/Post";
import dayjs from "dayjs";
import { PATH_HOME } from "../../../../routes/paths";
import { PostStatus } from "../../../../enums/Post";

interface Post {
  id: string;
  title: string;
  content: string;
  module: string;
  accountId: string;
  postCategoryId: string;
  createdAt: string; // Thêm trường ngày tạo nếu API trả về
}

const OutstandingNews: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Gọi API để lấy danh sách bài viết
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAll(1, 6); // Lấy 6 bài tin tức mới nhất
        // Lọc bài viết có module là PUBLIC
        const publicPosts = response.data.data.items.filter(
          (post: Post) => post.module === PostStatus.PUBLIC
        );
        setPosts(publicPosts);
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Hàm để rút ngắn tiêu đề nếu quá dài
  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length > maxLength) {
      return `${title.substring(0, maxLength)}...`;
    }
    return title;
  };

  if (loading) {
    return <p>Đang tải tin tức...</p>;
  }

  return (
    <div className="outstanding-news px-20">
      <h1
        className="text-[2rem] text-text_primary_light text-left mt-4"
        style={{ lineHeight: "60px", fontWeight: "600", letterSpacing: "3px" }}
      >
        Tin Tức Mới
      </h1>
      <ul className="news-list">
        {posts.map((post) => (
          <li key={post.id} className="news-item mb-1 w-full">
            <Link
              to={PATH_HOME.news_detail_page(post.id)}
              className="news-link  inline-block"
              style={{ borderBottom: "1px solid #fff" }}
            >
              <p className="text-[1.3rem] news-title text-text_primary_light">
                {truncateTitle(post.title, 100)}
              </p>
              {/* <p className="news-date">
                {dayjs(post.createdAt).format("DD/MM/YYYY")}
              </p> */}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OutstandingNews;
