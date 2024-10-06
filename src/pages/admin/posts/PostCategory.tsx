import React from "react";
import ListAllPostCategory from "./ListAllPostCategory";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";

const PostCategory: React.FC = () => {
  return (
    <AdminTemplate>
      <div className="flex items-center justify-start space-x-4 p-5">
        <ListAllPostCategory />
      </div>
    </AdminTemplate>
  );
};
export default PostCategory;
