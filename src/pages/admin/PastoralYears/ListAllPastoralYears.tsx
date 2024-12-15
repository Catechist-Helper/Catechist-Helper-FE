import React, { useState, useEffect } from "react";
import pastoralYearsApi from "../../../api/PastoralYear";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import { pastoralYearStatus } from "../../../enums/PastoralYear";
import sweetAlert from "../../../utils/sweetAlert";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";

const ListAllPastoralYears: React.FC = () => {
  const [pastoralYears, setPastoralYears] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchPastoralYears = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> =
        await pastoralYearsApi.getAllPastoralYears(1, 1000);
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        setPastoralYears(data.data.items);
      } else {
        console.log("No items found");
      }
    } catch (err) {
      console.error("Không thể lấy danh sách niên khóa: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastoralYears();
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-pastoral-years");
  };

  const handleToggleChange = (year: any) => {
    const newStatus =
      year.pastoralYearStatus === pastoralYearStatus.START
        ? pastoralYearStatus.FINISH
        : pastoralYearStatus.START;

    pastoralYearsApi
      .updatePastoralYears(year.id, year.name, year.note, newStatus)
      .then(() => {
        setPastoralYears((prevYears) =>
          prevYears.map((y) =>
            y.id === year.id ? { ...y, pastoralYearStatus: newStatus } : y
          )
        );
      })
      .catch((err) => {
        console.error("Không thể cập nhật trạng thái niên khóa: ", err);
        sweetAlert.alertFailed(
          "Không thể hoàn tất niên khóa vì vẫn còn lớp học đang hoạt động.",
          "Vui lòng đợi đến khi kết thúc tất cả các lớp học của niên khóa trước khi cập nhật trạng thái.",
          10000,
          45
        );
      });
  };

  const handleDeletePastoralYearClick = async (id: string) => {
    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa niên khóa này không?",
      "",
      undefined,
      undefined,
      "question"
    );

    if (confirm) {
      pastoralYearsApi
        .deletePastoralYears(id)
        .then(() => {
          setPastoralYears((prevYears) => prevYears.filter((y) => y.id !== id));

          sweetAlert.alertSuccess("Xóa thành công", "", 3000, 22);
        })
        .catch((err: Error) => {
          console.error(`Không thể xóa niên khóa với ID: ${id}`, err);
          sweetAlert.alertFailed(
            "Không thể xóa niên khóa vì đang có dữ liệu",
            "",
            5000,
            32
          );
        });
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Niên Khóa", width: 200 },
    { field: "note", headerName: "Ghi chú", width: 300 },
    {
      field: "pastoralYearStatus",
      headerName: "Trạng thái",
      width: 200,
      renderCell: (params) => (
        <label className="inline-flex items-center cursor-pointer">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2">
            {params.value === pastoralYearStatus.START ? "Bắt đầu" : "Kết thúc"}
          </span>
          <input
            type="checkbox"
            className="sr-only peer"
            checked={params.value === pastoralYearStatus.START}
            onChange={() => handleToggleChange(params.row)}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      ),
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
            onClick={() =>
              navigate(`/admin/update-pastoral-years/${params.row.id}`)
            }
          >
            Chỉnh sửa
          </Button>
          <Button
            className="btn btn-danger"
            color="error"
            variant="outlined"
            onClick={() => handleDeletePastoralYearClick(params.row.id)}
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
        Danh sách niên khóa
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
            Tạo niên khóa
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={fetchPastoralYears}
          >
            Tải lại
          </Button>
        </div>
      </div>
      <div className="px-2">
        <DataGrid
          rows={pastoralYears}
          columns={columns}
          loading={loading}
          paginationMode="client"
          localeText={viVNGridTranslation}
          disableRowSelectionOnClick
        />
      </div>
    </Paper>
  );
};

export default ListAllPastoralYears;
