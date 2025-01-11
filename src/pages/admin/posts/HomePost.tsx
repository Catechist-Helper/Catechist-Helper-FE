import React, { useState, useEffect } from "react";
import postCategoryApi from "../../../api/PostCategory";
import postsApi from "../../../api/Post";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import sweetAlert from "../../../utils/sweetAlert";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import viVNGridTranslation from "../../../locale/MUITable";
import { PostStatus } from "../../../enums/Post";
import AdminTemplate from "../../../components/Templates/AdminTemplate/AdminTemplate";
import { storeCurrentPath } from "../../../utils/utils";
import { PATH_ADMIN } from "../../../routes/paths";

const HomePost: React.FC = () => {
  const [postCategories, setPostCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> = await postsApi.getAll(
        1,
        100
      );
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        setPosts(data.data.items);
      } else {
        console.log("No posts found");
      }
    } catch (err) {
      console.error("Không thể tải bài viết: ", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostCategories = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> =
        await postCategoryApi.getAll(1, 100);
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        setPostCategories(data.data.items);
      } else {
        console.log("No categories found");
      }
    } catch (err) {
      console.error("Không thể tải danh mục bài viết: ", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPostCategories();
    storeCurrentPath(PATH_ADMIN.post);
  }, []);

  const handleCreatePost = () => {
    navigate("/admin/create-post");
  };

  const handleEditPostClick = (id: string): void => {
    navigate(`/admin/update-post/${id}`);
  };

  const handleDeletePostClick = async (id: string) => {
    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa bài viết này không?",
      "",
      undefined,
      undefined,
      "question"
    );

    if (confirm) {
      try {
        await postsApi.deletePosts(id);
        sweetAlert.alertSuccess("Bài viết đã xóa thành công!", "", 3000, 26);
        setPosts((prev) => prev.filter((post) => post.id !== id));
      } catch (err) {
        console.error("Không thể xóa bài viết: ", err);
        sweetAlert.alertFailed("Không thể xóa bài viết!", "", 3000, 26);
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Tiêu đề",
      width: 200,
      renderCell: (params) => (
        <Link className="text-dark" to={`/admin/post-detail/${params.row.id}`}>
          {params.value}
        </Link>
      ),
    },
    {
      field: "content",
      headerName: "Nội dung",
      width: 300,
      renderCell: (params) =>
        params.value
          .replace(/<[^>]*>/g, "")
          .split(" ")
          .slice(0, 10)
          .join(" ") + "...",
    },
    {
      field: "module",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) =>
        params.value === "PUBLIC" ? PostStatus.PUBLIC : PostStatus.PRIVATE,
    },
    {
      field: "createdAt",
      headerName: "Ngày đăng",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "postCategoryId",
      headerName: "Danh mục",
      width: 200,
      renderCell: (params) => {
        const category = postCategories.find(
          (category) => category.id === params.value
        );
        return category ? category.name : "Không có danh mục";
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <Button
            className="btn btn-primary"
            color="primary"
            variant="outlined"
            onClick={() => handleEditPostClick(params.row.id)}
          >
            Chỉnh sửa
          </Button>
          <Button
            className="btn btn-danger"
            color="error"
            variant="outlined"
            onClick={() => handleDeletePostClick(params.row.id)}
          >
            Xóa
          </Button>
        </div>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <AdminTemplate>
      <Paper
        sx={{
          width: "calc(100% - 3.8rem)",
          position: "absolute",
          left: "3.8rem",
        }}
      >
        <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
          BẢNG TIN
        </h1>
        <div className="flex justify-between mb-3 mt-3 px-3">
          <div className="min-w-[2px]" />
          <div className="flex gap-x-2">
            <Button
              className="btn btn-success"
              color="success"
              variant="outlined"
              onClick={handleCreatePost}
            >
              Tạo bài mới
            </Button>
            <Button color="primary" variant="contained" onClick={fetchPosts}>
              Tải lại
            </Button>
          </div>
        </div>
        <div className="px-3">
          <DataGrid
            rows={posts}
            columns={columns}
            loading={loading}
            paginationMode="client"
            localeText={viVNGridTranslation}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            sx={{
              height: 480,
              overflowX: "auto",
              "& .MuiDataGrid-root": {
                overflowX: "auto",
              },
            }}
          />
        </div>
      </Paper>
    </AdminTemplate>
  );
};

export default HomePost;
