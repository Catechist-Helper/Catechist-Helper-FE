import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import postsApi from "../../../api/Post";
import { PostStatus } from "../../../enums/Post";
import { PATH_HOME } from "../../../routes/paths";
import HomeTemplate from "../../../components/Templates/HomeTemplate/HomeTemplate";
import { formatDate } from "../../../utils/formatDate";

interface Post {
  id: string;
  title: string;
  content: string;
  module: string;
  createdAt: string;
}

const New: React.FC = () => {
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);

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
    const fetchPublicPosts = async () => {
      try {
        const response = await postsApi.getAll(1, 10);
        const allPosts: Post[] = response.data.data.items;

        const publicPosts = allPosts.filter(
          (post) => mapApiModuleToEnum(post.module) === PostStatus.PUBLIC
        );

        setPublicPosts(publicPosts);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };

    fetchPublicPosts();
  }, []);

  return (
    <HomeTemplate>
      <div className="px-20 py-10 pt-2">
        <h1
          className="text-[3rem] text-text_primary_light text-center mb-3"
          style={{
            lineHeight: "60px",
            fontWeight: "600",
            letterSpacing: "2px",
          }}
        >
          Tin Tức Của Giáo Xứ
        </h1>
        {publicPosts.length > 0 ? (
          <ul className="space-y-4">
            {publicPosts.map((post) => (
              <li
                key={post.id}
                className="border p-4 rounded-lg shadow-sm bg-gray-200"
              >
                <Link
                  to={PATH_HOME.home_news_detail}
                  state={{ postId: post.id }}
                  className="text-2xl font-semibold text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="ml-[2px] mt-1 text-[0.8rem] italic text-gray-700">
                  Đăng lúc: {formatDate.DD_MM_YYYY_Time(post.createdAt)}
                </p>
                <p className="text-gray-700 mt-2">
                  {post.content.length > 100
                    ? post.content
                        .replace(/<[^>]*>/g, "")
                        .replace("&nbsp;", ". ")
                        .substring(0, 100) + "..."
                    : post.content
                        .replace(/<[^>]*>/g, "")
                        .replace("&nbsp;", ". ")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Hiện tại không có bài viết nào.</p>
        )}
      </div>
    </HomeTemplate>
  );
};

export default New;
