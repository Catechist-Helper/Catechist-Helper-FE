import React from "react";

import ListAllPostCategory from "./ListAllPostCategory";
const PostCategory: React.FC = () => {
    return (
        <>
            <>
                <div className="flex items-center justify-start space-x-4 p-5">
                    {/* <button className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-full">
                        Danh mục
                    </button> */}

                    <ListAllPostCategory />
                </div>
            </>
        </>
    );
};
export default PostCategory;