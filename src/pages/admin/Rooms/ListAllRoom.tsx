import React, { useState, useEffect } from "react";
import roomsApi from "../../../api/Room";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";

const ListAllRooms: React.FC = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    const firstRes = await roomsApi.getAllRoom();
    await roomsApi
      .getAllRoom(1, firstRes.data.data.total)
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;

        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          setRooms(res.data.items);
        } else {
          console.log("No items found");
        }
      })
      .catch((err) => {
        console.error("Không thấy danh sách phòng học: ", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-room");
  };

  const handleEditNameClick = (id: string): void => {
    navigate(`/admin/update-room/${id}`);
  };

  const handleDeleteNameClick = async (id: string, name: string) => {
    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa phòng học này không?",
      "",
      undefined,
      undefined,
      "question"
    );

    if (confirm) {
      roomsApi
        .deleteRoom(id)
        .then(() => {
          sweetAlert.alertSuccess(`Phòng học đã xóa thành công.`, "", 3000, 28);
          setRooms((prev) => prev.filter((room: any) => room.id !== id));
        })
        .catch((err: any) => {
          console.error(`Không thể xóa phòng học với ID: ${id}`, err);
          if (err.response?.status === 400 || err.response?.status === 409) {
            sweetAlert.alertFailed(
              `${name} đang được sử dụng và không xóa được!`,
              "",
              3000,
              30
            );
          } else {
            sweetAlert.alertFailed(
              "Có lỗi xảy ra khi xóa phòng học. Vui lòng thử lại sau.",
              "",
              3000,
              30
            );
          }
        });
    }
  };

  // Cấu hình cột cho DataGrid
  const columns: GridColDef[] = [
    { field: "name", headerName: "Phòng học", width: 200 },
    { field: "description", headerName: "Mô tả", width: 300 },
    {
      field: "image",
      headerName: "Hình ảnh",
      width: 300,
      align: "center",
      renderCell: (params) =>
        params.value && (
          <div className="w-full h-full flex items-center">
            <img
              src={params.value}
              alt="Hình ảnh phòng học"
              style={{ width: "180px", height: "180px", borderRadius: "5px" }}
            />
          </div>
        ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <Button
            color="primary"
            variant="outlined"
            className="btn btn-primary"
            onClick={() => handleEditNameClick(params.row.id)}
          >
            Chỉnh sửa
          </Button>
          <Button
            color="error"
            variant="outlined"
            className="btn btn-danger"
            onClick={() =>
              handleDeleteNameClick(params.row.id, params.row.name)
            }
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
        Danh sách phòng học
      </h1>
      <div className="flex justify-between mb-3 mt-3 px-3">
        <div className="min-w-[2px]"></div>
        <div className="flex gap-x-2">
          <Button
            color="success"
            variant="outlined"
            className="btn btn-success"
            onClick={handleCreate}
          >
            Tạo phòng học
          </Button>
          <Button color="primary" variant="contained" onClick={fetchRooms}>
            Tải lại
          </Button>
        </div>
      </div>
      <div className="px-3">
        <DataGrid
          rows={rooms}
          columns={columns}
          loading={loading}
          paginationMode="client"
          rowHeight={200}
          localeText={viVNGridTranslation}
          sx={{
            height: 550,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          disableRowSelectionOnClick
        />
      </div>
    </Paper>
  );
};

export default ListAllRooms;
