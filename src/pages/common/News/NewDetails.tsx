import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import postsApi from "../../../api/Post";
import HeaderHome from "../../../components/Organisms/HeaderHome/HeaderHome";
import FooterHome from "../../../components/Organisms/FooterHome/FooterHome";
import { formatDate } from "../../../utils/formatDate";
import { Button } from "@mui/material";
import { LOCALSTORAGE_CONSTANTS } from "../../../constants/WebsiteConstant";
import { PATH_HOME } from "../../../routes/paths";
interface Post {
  id: string;
  title: string;
  content: string;
  module: string;
  createdAt: string;
}

const NewDetails: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const location = useLocation();

  const fetchPost = async (postId: string) => {
    try {
      const response = await postsApi.getById(postId);
      setPost(response.data.data);
    } catch (error) {
      console.error("Failed to fetch post details", error);
    }
  };

  useEffect(() => {
    if (location.state) {
      const { postId } = location.state;
      if (postId && postId != "") {
        fetchPost(postId);
        let count = 1;

        let interval = setInterval(() => {
          addTargetBlankToLinks();
          count++;
          if (count == 10) {
            clearInterval(interval);
          }
        }, 150);

        const addTargetBlankToLinks = () => {
          const newsDetailComponent = document.getElementById(
            "news_detail_component_id"
          );

          if (newsDetailComponent) {
            const links = newsDetailComponent.querySelectorAll("a");

            links.forEach((link) => {
              const href = link.getAttribute("href");

              if (href) {
                clearInterval(interval);

                if (href.includes("register-form")) {
                  // Tạo style animation cho các thẻ a có href chứa "register-form"
                  link.style.fontSize = "1.4rem";
                  link.style.color = "red";
                  link.style.animation = "colorChange 2s infinite";

                  // Thêm keyframes vào document
                  const styleSheet = document.styleSheets[0];
                  const keyframes = `
                    @keyframes colorChange {
                      0% { color: #f94449; }
                      50% { color: #1a66cc; }
                      100% { color: #c30010; }
                    }
                  `;
                  if (styleSheet.insertRule) {
                    styleSheet.insertRule(
                      keyframes,
                      styleSheet.cssRules.length
                    );
                  }
                } else {
                  link.style.fontSize = "1.4rem";
                  link.style.color = "red";
                  link.style.animation = "colorChange 2s infinite";

                  // Thêm keyframes vào document
                  const styleSheet = document.styleSheets[0];
                  const keyframes = `
                    @keyframes colorChange {
                      0% { color: #f94449; }
                      50% { color: #1a66cc; }
                      100% { color: #c30010; }
                    }
                  `;
                  if (styleSheet.insertRule) {
                    styleSheet.insertRule(
                      keyframes,
                      styleSheet.cssRules.length
                    );
                  }
                  // Set target="_blank" cho các thẻ a khác
                  link.setAttribute("target", "_blank");
                }
              }
            });
          }
        };
      }
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALSTORAGE_CONSTANTS.CURRENT_PAGE, PATH_HOME.news);
    }
  }, [location.state]);

  const navigate = useNavigate();
  return (
    <>
      <HeaderHome />
      <div className="container mx-auto p-5 pt-4" id="news_detail_component_id">
        <div className="px-20 py-10 pt-0">
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              navigate(-1);
            }}
          >
            Quay lại
          </Button>
          {post && (
            <>
              <p className="text-2xl font-semibold mt-3 text-blue-600">
                {post.title}
              </p>
              <p className="mt-1 mb-3 text-[1rem] italic text-gray-700">
                Đăng lúc: {formatDate.DD_MM_YYYY_Time(post.createdAt)}
              </p>{" "}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </>
          )}{" "}
        </div>
      </div>
      <FooterHome />
    </>
  );
};

export default NewDetails;
