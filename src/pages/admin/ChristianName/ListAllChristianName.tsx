import React, { useState, useEffect } from "react";
import christianNamesApi from "../../../api/ChristianName";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import sweetAlert from "../../../utils/sweetAlert";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import viVNGridTranslation from "../../../locale/MUITable";
import { formatDate } from "../../../utils/formatDate";

const ListAllChristianNames: React.FC = () => {
  const [christianNames, setChristianNames] = useState<any[]>([]);
  const [filteredChristianNames, setFilteredChristianNames] = useState<any[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [genderFilter, setGenderFilter] = useState<string>("Tất cả");
  const navigate = useNavigate();

  const fetchChristianNames = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> =
        await christianNamesApi.getAllChristianNames(1, 1000);
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        setChristianNames(data.data.items);
        setFilteredChristianNames(data.data.items);
      }
    } catch (err) {
      console.error("Không thấy danh sách tên thánh: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChristianNames();
  }, []);

  useEffect(() => {
    if (genderFilter === "Tất cả") {
      setFilteredChristianNames(christianNames);
    } else {
      setFilteredChristianNames(
        christianNames.filter((item) => item.gender === genderFilter)
      );
    }
  }, [genderFilter, christianNames]);

  const handleCreate = () => {
    navigate("/admin/create-christian-name");
  };

  const handleEditNameClick = (id: string): void => {
    navigate(`/admin/update-christian-name/${id}`);
  };

  const handleDeleteNameClick = async (id: string) => {
    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa tên thánh này không?",
      "",
      undefined,
      undefined,
      "question"
    );

    if (confirm) {
      try {
        await christianNamesApi.deleteChristianNames(id);
        sweetAlert.alertSuccess("Tên Thánh đã xóa thành công.", "", 3000, 26);
        setChristianNames((prev) => prev.filter((name) => name.id !== id));
      } catch (err) {
        console.error(`Không thể xóa tên thánh với ID: ${id}`, err);
        sweetAlert.alertFailed("Không thể xóa tên Thánh này");
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên", width: 200 },
    { field: "gender", headerName: "Giới tính", width: 150 },
    {
      field: "holyDay",
      headerName: "Ngày thánh",
      width: 150,
      renderCell: (params) => formatDate.DD_MM_YYYY(params.value),
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
            onClick={() => handleEditNameClick(params.row.id)}
          >
            Chỉnh sửa
          </Button>
          <Button
            className="btn btn-danger"
            color="error"
            variant="outlined"
            onClick={() => handleDeleteNameClick(params.row.id)}
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
        DANH SÁCH TÊN THÁNH
      </h1>
      <div className="flex justify-between mb-3 mt-3 px-3">
        <div>
          <FormControl
            sx={{
              minWidth: 120,
              padding: "0px",
            }}
          >
            <InputLabel id="gender-filter-label" className="">
              Giới tính
            </InputLabel>
            <Select
              labelId="gender-filter-label"
              label="Giới tính"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <MenuItem value="Tất cả">Tất cả</MenuItem>
              <MenuItem value="Nam">Nam</MenuItem>
              <MenuItem value="Nữ">Nữ</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <div className="flex gap-x-2">
            <Button
              className="btn btn-success"
              color="success"
              variant="outlined"
              onClick={handleCreate}
            >
              Tạo tên thánh
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={fetchChristianNames}
            >
              Tải lại
            </Button>
          </div>
        </div>
      </div>
      <div className="px-2">
        <DataGrid
          rows={filteredChristianNames}
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

export default ListAllChristianNames;
