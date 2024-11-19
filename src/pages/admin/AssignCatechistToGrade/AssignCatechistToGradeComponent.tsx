import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import majorApi from "../../../api/Major";
import gradeApi from "../../../api/Grade";
import sweetAlert from "../../../utils/sweetAlert";
import { CreateCatechistInGradeRequest } from "../../../model/Request/CatchistInGrade";
import viVNGridTranslation from "../../../locale/MUITable";
import catechistInGradeApi from "../../../api/CatchistInGrade";

export default function AssignCatechistToGradeComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [catechists, setCatechists] = useState<any[]>([]); // Bảng catechist chưa được assign
  const [assignedCatechists, setAssignedCatechists] = useState<any[]>([]); // Bảng catechist đã được assign
  // const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  // const [totalCatechist, setTotalCatechist] = useState<number>(0);

  const [mainCatechistId, setMainCatechistId] = useState<string | null>(null); // ID của trưởng khối
  const [gradeName, setGradeName] = useState<string>("");
  const [majorName, setMajorName] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [paginationModel2, setPaginationModel2] = useState<GridPaginationModel>(
    {
      page: 0,
      pageSize: 8,
    }
  );

  // Thông tin grade từ location.state
  useEffect(() => {
    const { majorId, gradeId, gradeName, majorName, totalCatechist } =
      location.state;
    // setSelectedMajor(majorId);
    setSelectedGrade(gradeId);
    setGradeName(gradeName);
    setMajorName(majorName);
    if (totalCatechist) {
    }
    // setTotalCatechist(totalCatechist);

    fetchCatechists(majorId); // Lấy danh sách catechists chưa được assign
    fetchAssignedCatechists(gradeId); // Lấy danh sách catechists đã được assign
  }, [location.state]);

  const fetchCatechists = async (majorId: string) => {
    try {
      const page = paginationModel.page + 1;
      const size = paginationModel.pageSize;
      const { data } = await majorApi.getCatechistsOfMajor(
        majorId,
        true,
        page,
        size
      );
      // Lọc bỏ catechists đã được assign
      const unassignedCatechists = data.data.items.filter(
        (catechist) =>
          !assignedCatechists.some((assigned) => assigned.id === catechist.id)
      );
      setCatechists(unassignedCatechists);
    } catch (error) {
      console.error("Error loading catechists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedCatechists = async (gradeId: string) => {
    try {
      // API để lấy danh sách catechist đã được assign ở grade
      const { data } = await gradeApi.getCatechistsOfGrade(gradeId);
      const fetchItems: any[] = [];
      [...data.data.items].forEach((item) => {
        fetchItems.push({ ...item, id: item.catechist.id });
      });
      setAssignedCatechists(fetchItems);
      const main = data.data.items.find((item: any) => item.isMain);
      if (main) {
        setMainCatechistId(main.catechist.id);
      }
    } catch (error) {
      console.error("Error loading assigned catechists:", error);
    }
  };

  const handleAddCatechist = (selectedIds: string[]) => {
    const selectedCatechists = catechists.filter((catechist) =>
      selectedIds.includes(catechist.id)
    );
    const addItems: any[] = [];
    selectedCatechists.forEach((item) => {
      addItems.push({ catechist: item, id: item.id });
    });
    setAssignedCatechists([...assignedCatechists, ...addItems]);
    setCatechists(
      catechists.filter((catechist) => !selectedIds.includes(catechist.id))
    ); // Xóa khỏi bảng chưa assign
  };

  const handleRemoveCatechist = (selectedIds: string[]) => {
    const removedCatechists = assignedCatechists.filter(
      (catechist) => !selectedIds.includes(catechist.catechist.id)
    );
    const removedItems: any[] = [];
    assignedCatechists
      .filter((catechist) => selectedIds.includes(catechist.catechist.id))
      .forEach((item) => {
        removedItems.push(item.catechist);
      });
    setAssignedCatechists(removedCatechists);
    setCatechists([...catechists, ...removedItems]); // Đưa lại vào bảng chưa assign
  };

  const handleMainCatechistChange = (id: string) => {
    setMainCatechistId(id); // Cập nhật ID của trưởng khối
  };

  const handleConfirm = async () => {
    if (!mainCatechistId) {
      sweetAlert.alertFailed(
        "Vui lòng chọn một giáo lý viên làm trưởng khối!",
        "",
        1000,
        22
      );
      return;
    }

    const requestData: CreateCatechistInGradeRequest = {
      gradeId: selectedGrade,
      catechistIds: assignedCatechists.map(
        (catechist) => catechist.catechist.id
      ),
      mainCatechistId: mainCatechistId,
    };

    try {
      await catechistInGradeApi.createCatechistInGrade(requestData);
      sweetAlert.alertSuccess("Gán giáo lý viên thành công!", "", 1000, 22);
      navigate(-1);
    } catch (error) {
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi gán giáo lý viên!",
        "",
        1000,
        22
      );
    }
  };

  // Columns cho DataGrid
  const columns1: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.imageUrl || "https://via.placeholder.com/150"}
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    { field: "fullName", headerName: "Tên giáo lý viên", width: 200 },
    { field: "gender", headerName: "Giới tính", width: 100 },
    {
      field: "christianName",
      headerName: "Tên thánh",
      width: 150,
      renderCell: (params) => params.row.christianName || "N/A", // Chỉnh sửa hiển thị tên thánh
    },
    {
      field: "level",
      headerName: "Cấp bậc",
      width: 150,
      renderCell: (params) =>
        params.row.level ? params.row.level.name : "N/A",
    },
    {
      field: "assign",
      headerName: "Thêm",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddCatechist([params.row.id])}
        >
          Thêm
        </Button>
      ),
    },
  ];

  const columns2: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={
            params.row.catechist.imageUrl || "https://via.placeholder.com/150"
          }
          alt="Catechist"
          width="50"
          height="50"
        />
      ),
    },
    {
      field: "fullName",
      headerName: "Tên giáo lý viên",
      width: 200,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 100,
      renderCell: (params) => params.row.catechist.gender,
    },
    {
      field: "christianName",
      headerName: "Tên thánh",
      width: 150,
      renderCell: (params) => params.row.catechist.christianName || "N/A", // Chỉnh sửa hiển thị tên thánh
    },
    {
      field: "level",
      headerName: "Cấp bậc",
      width: 150,
      renderCell: (params) =>
        params.row.catechist.level ? params.row.catechist.level.name : "N/A",
    },
    {
      field: "remove",
      headerName: "Xóa",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleRemoveCatechist([params.row.catechist.id])}
        >
          Xóa
        </Button>
      ),
    },
    {
      field: "main",
      headerName: "Trưởng khối",
      width: 120,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={mainCatechistId === params.row.catechist.id}
          onChange={() => handleMainCatechistChange(params.row.catechist.id)}
        />
      ),
    },
  ];

  return (
    <Paper sx={{ width: "calc(100% - 3.8rem)", position: "absolute" }}>
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Xếp giáo lý viên cho {gradeName}
      </h1>

      {/* Thông tin Grade */}
      <div className="mx-3 mt-2">
        <h3>
          <strong>Thông tin Khối: </strong> {gradeName}
        </h3>
        {/* Hiển thị thông tin major và pastoral year nếu cần */}
        <p>
          <strong>Ngành: </strong> {majorName}
        </p>
        {/* <p
          className={`${assignedCatechists.length < totalCatechist ? "text-danger" : "text-success"}`}
        >
          <strong>Số lượng giáo lý viên cần thiết: {totalCatechist}</strong>
        </p> */}

        {/* Bảng DataGrid chưa gán */}
        <h3 className="mt-3">
          <strong>Danh sách giáo lý viên chưa gán</strong>
        </h3>
        <DataGrid
          rows={catechists}
          columns={columns1}
          paginationMode="server"
          rowCount={catechists.length}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          pageSizeOptions={[8, 25, 50]}
          checkboxSelection
          sx={{ border: 0 }}
          localeText={viVNGridTranslation}
          disableRowSelectionOnClick
        />

        {/* Bảng DataGrid đã gán */}
        <h3 className="mt-3">
          <strong>
            Danh sách giáo lý viên đã gán{" "}
            {/* <span
              className={`${assignedCatechists.length < totalCatechist ? "text-danger" : "text-success"}`}
            >
              Số lượng hiện tại: {assignedCatechists.length}
            </span> */}
          </strong>{" "}
        </h3>
        <DataGrid
          rows={assignedCatechists}
          columns={columns2}
          paginationMode="server"
          rowCount={assignedCatechists.length}
          loading={loading}
          paginationModel={paginationModel2}
          onPaginationModelChange={(newModel) => setPaginationModel2(newModel)}
          pageSizeOptions={[8, 25, 50]}
          checkboxSelection
          sx={{ border: 0 }}
          localeText={viVNGridTranslation}
          disableRowSelectionOnClick
        />

        <div className="flex justify-end mt-3">
          <Button variant="contained" color="success" onClick={handleConfirm}>
            Xác nhận
          </Button>
          <Button variant="outlined" color="error" onClick={() => navigate(-1)}>
            Hủy bỏ
          </Button>
        </div>
      </div>
    </Paper>
  );
}
