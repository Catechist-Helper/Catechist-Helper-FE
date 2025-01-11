import React, { useState, useEffect } from "react";
import postCategoryApi from "../../../api/PostCategory";
import postsApi from "../../../api/Post";
import sweetAlert from "../../../utils/sweetAlert";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";
import { useNavigate } from "react-router-dom";
import { PATH_ADMIN } from "../../../routes/paths";
import { storeCurrentPath } from "../../../utils/utils";

const ListAllPostCategory: React.FC = () => {
  const [postCategories, setPostCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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
        console.log("No items found");
      }
    } catch (err) {
      console.error("Không thấy danh mục: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostCategories();
    storeCurrentPath(PATH_ADMIN.post_category);
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-post-category");
  };

  const handleEditCategoryClick = async (id: string): Promise<void> => {
    try {
      const postsResponse = await postsApi.getAll(1, 999);
      const posts = postsResponse.data.data.items;
      const isCategoryInUse = posts.some(
        (post: any) => post.postCategoryId === id
      );

      if (isCategoryInUse) {
        sweetAlert.alertWarning(
          "Danh mục này đang được sử dụng trong bài viết. Không thể chỉnh sửa!",
          "",
          5000,
          27
        );
        return;
      }

      navigate(`/admin/update-post-category/${id}`);
    } catch (err) {
      console.error(`Lỗi khi kiểm tra danh mục có ID: ${id}`, err);
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi kiểm tra danh mục!",
        "",
        3000,
        27
      );
    }
  };

  const handleDeleteCategoryClick = async (id: string): Promise<void> => {
    try {
      const postsResponse = await postsApi.getAll(1, 100);
      const posts = postsResponse.data.data.items;

      const isPostUsingCategory = posts.some(
        (post: any) => post.postCategoryId === id
      );

      if (isPostUsingCategory) {
        sweetAlert.alertWarning(
          "Không thể xóa danh mục này vì đang được sử dụng trong bài viết!",
          "",
          5000,
          27
        );
        return;
      }

      const confirm = await sweetAlert.confirm(
        "Bạn có chắc là muốn xóa danh mục này không?",
        "",
        undefined,
        undefined,
        "question"
      );

      if (confirm) {
        await postCategoryApi.deleteCategory(id);
        sweetAlert.alertSuccess("Xóa danh mục thành công.", "", 3000, 27);
        setPostCategories((prev) =>
          prev.filter((category) => category.id !== id)
        );
      }
    } catch (err) {
      console.error(`Lỗi khi xóa danh mục có ID: ${id}`, err);
      sweetAlert.alertFailed("Xóa danh mục thất bại!", "", 3000, 27);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên", width: 200 },
    { field: "description", headerName: "Mô tả", width: 300 },
    {
      field: "actions",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <Button
            className="btn btn-primary"
            color="primary"
            variant="outlined"
            onClick={() => handleEditCategoryClick(params.row.id)}
          >
            Chỉnh sửa
          </Button>
          <Button
            className="btn btn-danger"
            color="error"
            variant="outlined"
            onClick={() => handleDeleteCategoryClick(params.row.id)}
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
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Danh mục đăng tin
      </h1>
      <div className="flex justify-between mb-3 mt-3 px-3">
        <div className="min-w-[2px]" />
        <div className="flex gap-x-2">
          <Button
            className="btn btn-success"
            color="success"
            variant="outlined"
            onClick={handleCreate}
          >
            Tạo danh mục
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={fetchPostCategories}
          >
            Tải lại
          </Button>
        </div>
      </div>
      <div className="px-3">
        <DataGrid
          rows={postCategories}
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
  );
};

export default ListAllPostCategory;
