import React, { useState, useEffect } from "react";
import systemConfigApi from "../../../api/SystemConfiguration";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import {
  getSystemConfigEnumDescription,
  SystemConfigKey,
} from "../../../enums/SystemConfig";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";

const ListAllConfig: React.FC = () => {
  const [systemConfig, setSystemConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>("Tất cả");
  const [filteredConfig, setFilteredConfig] = useState<any[]>([]);

  const fetchSystemConfigs = async () => {
    try {
      const { data }: AxiosResponse<BasicResponse> =
        await systemConfigApi.getAllConfig(1, 10);
      if (
        data.statusCode.toString().trim().startsWith("2") &&
        data.data.items != null
      ) {
        const sortedData = data.data.items.sort(
          (a: any, b: any) =>
            Object.values(SystemConfigKey).indexOf(a.key) -
            Object.values(SystemConfigKey).indexOf(b.key)
        );
        setSystemConfig(sortedData);
        setFilteredConfig(sortedData);
      } else {
        console.log("No items found");
      }
    } catch (err) {
      console.error("Không thấy cấu hình hệ thống : ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemConfigs();
  }, []);

  useEffect(() => {
    if (categoryFilter === "Tất cả") {
      setFilteredConfig(systemConfig);
    } else if (categoryFilter === "Xếp lớp giáo lý") {
      setFilteredConfig(
        systemConfig.filter((item) =>
          [
            SystemConfigKey.START_DATE,
            SystemConfigKey.END_DATE,
            SystemConfigKey.START_TIME,
            SystemConfigKey.END_TIME,
            SystemConfigKey.WEEKDAY,
            SystemConfigKey.RestrictedDateManagingCatechism,
          ].includes(item.key)
        )
      );
    } else if (categoryFilter === "Phỏng vấn") {
      setFilteredConfig(
        systemConfig.filter(
          (item) =>
            item.key === SystemConfigKey.RestrictedUpdateDaysBeforeInterview
        )
      );
    }
  }, [categoryFilter, systemConfig]);

  const handleEditCategoryClick = (id: string): void => {
    navigate(`/admin/update-system-configurations/${id}`);
  };

  const dayMap: Record<string, string> = {
    Sunday: "Chủ Nhật",
    Monday: "Thứ Hai",
    Tuesday: "Thứ Ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ Năm",
    Friday: "Thứ Sáu",
    Saturday: "Thứ Bảy",
  };

  const columns: GridColDef[] = [
    {
      field: "key",
      headerName: "Thông số",
      width: 350,
      renderCell: (params) => getSystemConfigEnumDescription(params.value),
    },
    {
      field: "value",
      headerName: "Giá trị",
      width: 300,
      renderCell: (params) => {
        return params.row.key == SystemConfigKey.WEEKDAY
          ? `${dayMap[params.value] ? dayMap[params.value] : "Không xác định"}`
          : params.value;
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
            onClick={() => handleEditCategoryClick(params.row.id)}
          >
            Chỉnh sửa
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
        CẤU HÌNH HỆ THỐNG
      </h1>
      <div className="flex justify-between mb-3 mt-3 px-3">
        <div>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="category-filter-label">Danh mục</InputLabel>
            <Select
              label="Danh mục"
              labelId="category-filter-label"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="Tất cả">Tất cả</MenuItem>
              <MenuItem value="Xếp lớp giáo lý">Xếp lớp giáo lý</MenuItem>
              <MenuItem value="Phỏng vấn">Phỏng vấn</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <Button
            color="primary"
            variant="contained"
            onClick={fetchSystemConfigs}
          >
            Tải lại
          </Button>
        </div>
      </div>
      <div className="px-2">
        <DataGrid
          rows={filteredConfig}
          columns={columns}
          loading={loading}
          paginationMode="client"
          localeText={viVNGridTranslation}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </div>
    </Paper>
  );
};

export default ListAllConfig;
