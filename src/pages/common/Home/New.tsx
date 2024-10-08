import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import postsApi from "../../../api/Post";
import { PostStatus } from "../../../enums/Post";
import HeaderHome from "../../../components/Organisms/HeaderHome/HeaderHome";
import FooterHome from "../../../components/Organisms/FooterHome/FooterHome";

interface Post {
    id: string;
    title: string;
    content: string;
    module: string;
}

const New: React.FC = () => {
    const [publicPosts, setPublicPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPublicPosts = async () => {
            try {
                const response = await postsApi.getAll(1, 10);
                console.log(response.data.data.items);
                const allPosts: Post[] = response.data.data.items;


                const publicPosts = allPosts.filter(post => {
                    console.log(post.module);
                    return post.module === PostStatus.PUBLIC;
                });

                setPublicPosts(publicPosts);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            }
        };

        fetchPublicPosts();
    }, []);

    return (
        <>
            <HeaderHome />
            <div className="px-20 py-10">
                <h1 className="text-3xl font-bold mb-6">Tin Tức</h1>
                {publicPosts.length > 0 ? (
                    <ul className="space-y-4">
                        {publicPosts.map((post) => (
                            <li key={post.id} className="border p-4 rounded-lg shadow-sm bg-white">
                                <Link to={`/new-detail/${post.id}`} className="text-2xl font-semibold text-blue-600 hover:underline">
                                    {post.title}
                                </Link>
                                <p className="text-gray-700 mt-2">
                                    {post.content.length > 100
                                        ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) + "..."
                                        : post.content.replace(/<[^>]*>/g, '')}
                                </p>

                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Hiện tại không có bài viết nào.</p>
                )}
            </div>
            <FooterHome />
        </>
    );
};

export default New;
