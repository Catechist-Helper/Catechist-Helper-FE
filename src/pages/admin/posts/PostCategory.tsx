import React from "react";
import ListAllPostCategory from "./ListAllPostCategory";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";

const PostCategory: React.FC = () => {
  return (
    <AdminTemplate>
      <div className="flex items-center justify-start space-x-4 p-5">
        {/* <button className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-full">
                        Danh mục
                    </button> */}

        <ListAllPostCategory />
      </div>
    </AdminTemplate>
  );
};
export default PostCategory;
