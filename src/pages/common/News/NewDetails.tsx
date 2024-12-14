import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import postsApi from "../../../api/Post";
import HeaderHome from "../../../components/Organisms/HeaderHome/HeaderHome";
import FooterHome from "../../../components/Organisms/FooterHome/FooterHome";
interface Post {
  id: string;
  title: string;
  content: string;
  module: string;
}

const NewDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postsApi.getById(id!);
        console.log(response.data);
        setPost(response.data.data);
      } catch (error) {
        console.error("Failed to fetch post details", error);
      }
    };

    if (id) {
      fetchPost();
    }
    const addTargetBlankToLinks = () => {
      const newsDetailComponent = document.getElementById(
        "news_detail_component_id"
      );

      if (newsDetailComponent) {
        const links = newsDetailComponent.querySelectorAll("a");

        links.forEach((link) => {
          const href = link.getAttribute("href");

          if (href && !href.includes("register-form")) {
            link.setAttribute("target", "_blank");
          }
        });
      }
    };

    let count = 1;

    let interval = setInterval(() => {
      addTargetBlankToLinks();
      count++;
      if (count == 20) {
        clearInterval(interval);
      }
    }, 200);
  }, [id]);

  return (
    <>
      <HeaderHome />
      <div className="container mx-auto p-5" id="news_detail_component_id">
        {post && (
          <>
            <div className="px-20 py-10">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </>
        )}
      </div>
      <FooterHome />
    </>
  );
};

export default NewDetails;
