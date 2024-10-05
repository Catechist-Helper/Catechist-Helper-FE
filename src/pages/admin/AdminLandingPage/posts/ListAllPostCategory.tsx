import React, { useState, useEffect } from "react";
import postCategoryApi from "../../../../api/PostCategory";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../../model/BasicResponse";
import { useNavigate } from "react-router-dom";
const ListAllPostCategory: React.FC = () => {
    const [postCategories, setPostCategories] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        postCategoryApi
            .getAll(1, 5)
            .then((axiosRes: AxiosResponse) => {
                const res: BasicResponse = axiosRes.data;
                console.log("Response data: ", res);

                if (res.statusCode.toString().trim().startsWith("2") && res.data.items != null) {
                    console.log("Items: ", res.data.items);
                    setPostCategories(res.data.items);
                } else {
                    console.log("No items found");
                }
            })
            .catch((err) => {
                console.error("Không thấy danh mục : ", err);
            });
    }, []);

    const handleCreate = () => {
        navigate("/admin/create-post-category");
    };

    const handleEditCategoryClick = (id: string): void => {
        navigate(`/admin/update-post-category/${id}`);
    }

    const handleDeleteCategoryClick = (id: string): void => {
        if (window.confirm("Bạn có chắc là muốn xóa danh mục này không?")) {
          postCategoryApi
            .deleteCategory(id)
            .then(() => {
              console.log(`Category with ID: ${id} đã xóa thành công.`);
              window.location.reload(); 
            })
            .catch((err: Error) => {
              console.error(`Failed to delete category with ID: ${id}`, err);
            });
        }
      };
    
    console.log(ListAllPostCategory)
    return (
        <>  
            <div className="container mt-5 ">
            <div className="mb-10 text-center fw-bold">
            <h1>DANH MỤC ĐĂNG TIN</h1>
            </div>
                <div className="d-flex">
                    <div className="w-25">
                        <button className="btn btn-primary" onClick={handleCreate}>Create Category</button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {postCategories.length > 0 ? (
                            postCategories.map((category: any) => (
                                <tr key={category.id}>
                                    <td>
                                        <div className="text-dark" >
                                            {category.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-dark text-decoration-none">{category.description}</div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEditCategoryClick(category.id)}
                                            className="btn btn-info"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategoryClick(category.id)}
                                            className="btn btn-warning"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>Không thấy danh sách danh mục</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ListAllPostCategory;
