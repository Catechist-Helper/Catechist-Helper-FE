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
  }, [id]);
  

  return (
    <>
      <HeaderHome /> 
      <div className="container mx-auto p-5">
        {post && (
          <>
            <div className="px-20 py-10">
              {/* <h1 className="text-3xl font-bold mb-6">{post.title}</h1> */}
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
