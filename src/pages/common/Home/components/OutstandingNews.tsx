import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import postsApi from "../../../../api/Post";
import { PATH_HOME } from "../../../../routes/paths";
import { PostStatus } from "../../../../enums/Post";
import { formatDate } from "../../../../utils/formatDate";

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

  const mapApiModuleToEnum = (module: string): string => {
    switch (module.toLowerCase()) {
      case PostStatus.PUBLIC.toLocaleLowerCase():
        return PostStatus.PUBLIC;
      case PostStatus.PRIVATE.toLocaleLowerCase():
        return PostStatus.PRIVATE;
      case "PUBLIC".toLocaleLowerCase():
        return PostStatus.PUBLIC;
      case "PRIVATE".toLocaleLowerCase():
        return PostStatus.PRIVATE;
      default:
        return "Không xác định";
    }
  };

  useEffect(() => {
    // Gọi API để lấy danh sách bài viết
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAll(1, 6); // Lấy 6 bài tin tức mới nhất
        // Lọc bài viết có module là PUBLIC
        const publicPosts = response.data.data.items
          .filter(
            (post: Post) =>
              mapApiModuleToEnum(post.module) === PostStatus.PUBLIC
          )
          .sort((a: Post, b: Post) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
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
    return (
      <div className="outstanding-news px-20">
        <h1
          className="text-[1.5rem] text-gray-300 text-left mt-4"
          style={{
            lineHeight: "60px",
            fontWeight: "600",
            letterSpacing: "1px",
          }}
        >
          Đang tải tin tức...
        </h1>
      </div>
    );
  }

  return (
    <div className="outstanding-news px-20">
      <h1
        className="text-[2rem] text-text_primary_light text-left mt-4"
        style={{ lineHeight: "60px", fontWeight: "600", letterSpacing: "2px" }}
      >
        Tin Tức Mới
      </h1>
      <ul className="news-list">
        {posts.map((post) => (
          <li key={post.id} className="news-item mb-[10px] w-full">
            <Link
              to={PATH_HOME.home_news_detail}
              state={{ postId: post.id }}
              className="news-link inline-block"
              style={{ borderBottom: "1px solid #fff" }}
            >
              <span className="text-[1.15rem] news-date text-gray-300 italic">
                {formatDate.DD_MM_YYYY_Time(post.createdAt)}
              </span>
              <span className="text-[1.3rem] news-title text-gray-200">
                {" - "}
                {truncateTitle(post.title, 100)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OutstandingNews;
