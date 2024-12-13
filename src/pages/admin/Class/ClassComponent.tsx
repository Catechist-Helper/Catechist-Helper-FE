import { useState, useEffect } from "react";
import {
  // useNavigate,
  useLocation,
} from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Button,
  Dialog,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
} from "@mui/material";
import classApi from "../../../api/Class"; // Import API Class
import majorApi from "../../../api/Major"; // Import API Major
import gradeApi from "../../../api/Grade"; // Import API Grade
import timetableApi from "../../../api/Timetable";
import catechistInClassApi from "../../../api/CatechistInClass";
import pastoralYearsApi from "../../../api/PastoralYear"; // Import API PastoralYears
import roomApi from "../../../api/Room"; // Import API Room
import viVNGridTranslation from "../../../locale/MUITable";
import sweetAlert from "../../../utils/sweetAlert";
import { CreateCatechistInClassRequest } from "../../../model/Request/CatechistInClass";
import { CreateSlotRequest } from "../../../model/Request/Slot";
import { formatDate } from "../../../utils/formatDate";
import {
  CatechistSlotResponse,
  ClassResponse,
} from "../../../model/Response/Class";
import useAppContext from "../../../hooks/useAppContext";
import FileSaver from "file-saver";
import { ClassStatusEnum, ClassStatusString } from "../../../enums/Class";
import {
  CatechistInSlotTypeEnum,
  CatechistInSlotTypeEnumString,
} from "../../../enums/CatechistInSlot";
import AdminRequestLeaveDialog from "./AdminRequestLeaveDialog";
import absenceApi from "../../../api/AbsenceRequest";

export default function ClassComponent() {
  const location = useLocation();
  // const navigate = useNavigate();

  // States for class data
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [pastoralYears, setPastoralYears] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedPastoralYear, setSelectedPastoralYear] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [finishInitData, setFinishInitData] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(
    null
  );
  const [openLeaveDialog, setOpenLeaveDialog] = useState<boolean>(false);

  // State for adding timetable
  const [openTimetableDialog, setOpenTimetableDialog] =
    useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null); // State to store the uploaded file
  const { enableLoading, disableLoading } = useAppContext();
  const [slotAbsenceId, setSlotAbsenceId] = useState<string>("");
  const [absenceCatechistOptions, setAbsenceCatechistOptions] = useState<
    CatechistSlotResponse[]
  >([]);
  const [absenceDate, setAbsenceDate] = useState<string>("");

  // States for slot dialog
  const [openSlotDialog, setOpenSlotDialog] = useState<boolean>(false);
  const [updateSlotMode, setUpdateSlotMode] = useState<boolean>(false);

  const [rooms, setRooms] = useState<any[]>([]); // Room list
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [assignedCatechists, setAssignedCatechists] = useState<any[]>([]); // Assigned catechists
  const [mainCatechistId, setMainCatechistId] = useState<string | null>(null); // ID of main catechist

  // States for catechists in Grade
  const [catechists, setCatechists] = useState<any[]>([]); // Catechists list for DataGrid
  const [paginationModelCatechists, setPaginationModelCatechists] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 8,
    });
  // const [rowCountCatechists, setRowCountCatechists] = useState<number>(0);
  const [selectedRowsCatechists, setSelectedRowsCatechists] =
    useState<GridRowSelectionModel>([]);

  // States for slots
  const [openSlotsDialog, setOpenSlotsDialog] = useState<boolean>(false);
  const [slots, setSlots] = useState<any[]>([]); // Slots list
  const [selectedClassView, setSelectedClassView] = useState<any>(null); // Loading state for slots

  useEffect(() => {
    fetchMajors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPastoralYears();
        if (location.state) {
          if (location.state.gradeId) {
            const { majorId, gradeId } = location.state;
            setSelectedMajor(majorId);
            await fetchGrades(majorId, gradeId);
          } else if (location.state.classIds) {
            console.log("location.state.classIds", location.state.classIds);
            enableLoading();
            setTimeout(() => {
              fetchClasses(undefined, undefined, location.state.classIds);
              disableLoading();
            }, 1200);
            setSelectedMajor("all");
          }
        } else {
          setSelectedMajor("all");
        }
      } catch (error) {
        console.error("Lỗi khi tải", error);
      } finally {
        setFinishInitData(true);
      }
    };
    fetchData();
  }, [location.state]);

  useEffect(() => {
    if (selectedMajor && selectedMajor != "all" && selectedMajor != "") {
      fetchGrades(selectedMajor);
      setSelectedGrade("all");
    }
  }, [selectedMajor]);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên lớp", width: 200 },
    {
      field: "numberOfCatechist",
      headerName: "Số lượng giáo lý viên",
      width: 180,
    },
    {
      field: "major",
      headerName: "Ngành",
      width: 150,
      renderCell: (params) => params.row.majorName,
    },
    {
      field: "grade",
      headerName: "Khối",
      width: 150,
      renderCell: (params) => params.row.gradeName,
    },
    {
      field: "startDate",
      headerName: "Ngày bắt đầu",
      width: 180,
      renderCell: (params: any) => {
        return formatDate.DD_MM_YYYY(params.value);
      },
    },
    {
      field: "endDate",
      headerName: "Ngày kết thúc",
      width: 180,
      renderCell: (params: any) => {
        return formatDate.DD_MM_YYYY(params.value);
      },
    },
    {
      field: "classStatus",
      headerName: "Trạng thái",
      width: 180,
      renderCell: (params) => {
        switch (params.value) {
          case ClassStatusEnum.Active:
            return (
              <span className="rounded py-1 px-2 bg-warning text-black">
                {ClassStatusString.Active}
              </span>
            );
          case ClassStatusEnum.Finished:
            return (
              <span className="rounded py-1 px-2 bg-success text-white">
                {ClassStatusString.Finished}
              </span>
            );
          default:
            return <></>;
        }
      },
    },
    {
      field: "slotCount",
      headerName: "Tiết học",
      width: 180,
      renderCell: (params) => {
        return (
          <p>
            {params.row.slotCount <= 0 ? (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleOpenSlotDialog(params.row)}
              >
                Tạo tiết học
              </Button>
            ) : (
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  setSelectedClassView(params.row);
                  handleViewSlots(params.row.id);
                }}
              >
                Xem tiết học
              </Button>
            )}
          </p>
        );
      },
    },
    {
      field: "export",
      headerName: "Xuất danh sách",
      width: 180,
      renderCell: (params: any) => {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const action = async () => {
                try {
                  enableLoading();
                  const { data } = await timetableApi.exportClassData(
                    params.row.id
                  );

                  // Tạo Blob từ response và sử dụng FileSaver để tải xuống file
                  const blob = new Blob([data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  });
                  FileSaver.saveAs(blob, `${params.row.name}.xlsx`);
                } catch (error) {
                  console.error("Lỗi khi xuất danh sách:", error);
                  sweetAlert.alertFailed(
                    "Có lỗi xảy ra khi xuất danh sách!",
                    "",
                    1000,
                    22
                  );
                } finally {
                  disableLoading();
                }
              };
              action();
            }}
          >
            Xuất danh sách
          </Button>
        );
      },
    },
  ];

  const fetchClasses = async (
    changeInitDate?: boolean,
    defaultGradeId?: string,
    classIds?: string[]
  ) => {
    try {
      setLoading(true);
      const page = paginationModel.page + 1;
      const size = paginationModel.pageSize;

      const { data } = await classApi.getAllClasses(
        selectedMajor && selectedMajor != "all" ? selectedMajor : "",
        defaultGradeId
          ? defaultGradeId
          : selectedGrade && selectedGrade != "all"
            ? selectedGrade
            : "",
        selectedPastoralYear,
        page,
        size
      );

      const filterDataByClassIds =
        classIds && classIds.length > 0
          ? data.data.items.filter(
              (item) => classIds.findIndex((id) => id == item.id) >= 0
            )
          : data.data.items;

      const updatedRows = await Promise.all(
        filterDataByClassIds.map(async (classItem: any) => {
          const slotCount = await fetchSlotCountOfClass(classItem.id);
          return {
            ...classItem,
            slotCount,
          };
        })
      );

      setRows(updatedRows);
      setRowCount(updatedRows.length);
    } catch (error) {
      console.error("Error loading classes:", error);
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi tải danh sách lớp!",
        "",
        1000,
        22
      );
    } finally {
      setLoading(false);
      if (changeInitDate) {
        setFinishInitData(true);
      }
    }
  };

  const fetchSlotCountOfClass = async (classId: string) => {
    try {
      const { data } = await classApi.getSlotsOfClass(classId, 1, 100);
      return data.data.total;
    } catch (error) {
      console.error("Error loading grades:", error);
      return "N/A";
    }
  };

  const fetchPastoralYears = async () => {
    try {
      const { data } = await pastoralYearsApi.getAllPastoralYears();
      // Sắp xếp theo niên khóa gần nhất tới xa nhất
      const sortedPastoralYears = data.data.items.sort((a: any, b: any) => {
        const yearA = parseInt(a.name.split("-")[0]);
        const yearB = parseInt(b.name.split("-")[0]);
        return yearB - yearA;
      });
      setPastoralYears(sortedPastoralYears);
      setSelectedPastoralYear(sortedPastoralYears[0].id);
    } catch (error) {
      console.error("Error loading pastoral years:", error);
    }
  };

  const fetchMajors = async () => {
    try {
      const { data } = await majorApi.getAllMajors();

      const sortedArray = data.data.items.sort(
        (a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel
      );

      setMajors(sortedArray);
    } catch (error) {
      console.error("Error loading majors:", error);
    }
  };

  const fetchGrades = async (majorId: string, defaultGradeId?: string) => {
    try {
      const { data } = await gradeApi.getAllGrades(majorId);

      const sortedArray = data.data.items.sort((a: any, b: any) => {
        // So sánh theo hierarchyLevel trước
        if (a.major.hierarchyLevel !== b.major.hierarchyLevel) {
          return a.major.hierarchyLevel - b.major.hierarchyLevel;
        }
        // Nếu hierarchyLevel bằng nhau, so sánh theo name
        return a.name.localeCompare(b.name);
      });

      setGrades(sortedArray);
      if (defaultGradeId) {
        setSelectedGrade(defaultGradeId);
        await fetchClasses(true, defaultGradeId);
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    }
  };

  useEffect(() => {
    if (finishInitData) {
      fetchClasses();
    }
  }, [selectedPastoralYear, selectedMajor, selectedGrade, paginationModel]);

  const handleAddCatechist = (selectedIds: string[]) => {
    const selectedCatechists = catechists.filter((catechist) =>
      selectedIds.includes(catechist.id)
    );
    setAssignedCatechists([...assignedCatechists, ...selectedCatechists]);
    setCatechists(
      catechists.filter((catechist) => !selectedIds.includes(catechist.id))
    ); // Remove from unassigned list
  };

  const handleRemoveCatechist = (selectedIds: string[]) => {
    const removedCatechists = assignedCatechists.filter(
      (catechist) => !selectedIds.includes(catechist.id)
    );
    setAssignedCatechists(removedCatechists);
    setCatechists([
      ...catechists,
      ...assignedCatechists.filter((catechist) =>
        selectedIds.includes(catechist.id)
      ),
    ]); // Add back to unassigned list
  };

  const handleOpenSlotDialog = async (
    selectedClass: ClassResponse,
    updateMode?: boolean
  ) => {
    setUpdateSlotMode(false);
    setSelectedClass(selectedClass);
    await fetchRooms();
    await fetchCatechists(selectedClass.gradeId); // Fetch catechists when opening the dialog
    if (updateMode) {
      setUpdateSlotMode(true);
      const res = await classApi.getCatechistsOfClass(
        selectedClass.id,
        1,
        1000
      );
      const secondRes = await gradeApi.getCatechistsOfGrade(
        selectedClass.gradeId,
        false,
        1,
        1000,
        selectedPastoralYear
      );

      // const fetchItems: any[] = [];
      // [...data.data.items].forEach((item) => {
      //   fetchItems.push({ ...item, id: item.catechist.id });
      // });

      // setCatechists(fetchItems);
      const catechistInClassUpdate = res.data.data.items;
      const catechistInGradeUpdate = secondRes.data.data.items;

      let selectedIds: string[] = [];
      catechistInClassUpdate.forEach((item) => {
        selectedIds.push(item.catechist.id);
        if (item.isMain) {
          setMainCatechistId(item.catechist.id);
        }
      });

      const selectedCatechists = catechistInGradeUpdate.filter(
        (catechist: any) => selectedIds.includes(catechist.catechist.id)
      );
      const fetchItems: any[] = [];
      [...selectedCatechists].forEach((item) => {
        fetchItems.push({ ...item, id: item.catechist.id });
      });
      setAssignedCatechists([...assignedCatechists, ...fetchItems]);
      // setCatechists(
      //   catechists.filter((catechist) => !selectedIds.includes(catechist.id))
      // );
    }
    setOpenSlotDialog(true);
  };

  useEffect(() => {
    if (!openSlotDialog) {
      setSelectedRoom(null);
      setAssignedCatechists([]);
    }
  }, [openSlotDialog]);

  const fetchRooms = async () => {
    try {
      const { data } = await roomApi.getAllRoom(
        1,
        1000,
        selectedPastoralYear,
        true
      );
      setRooms(data.data.items);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const fetchCatechists = async (gradeId: string) => {
    try {
      const { data } = await gradeApi.getCatechistsOfGrade(
        gradeId,
        true,
        1,
        1000,
        selectedPastoralYear
      );

      let fetchItems: any[] = []; // Đảm bảo mảng là extensible

      const processItems = async () => {
        const promises = [...data.data.items].map(async (item) => {
          const remainingClassHavingSlots =
            await catechistInClassApi.getClassesRemainingSlotsOfCatechist(
              item.catechist.id
            );

          if (remainingClassHavingSlots.data.data.length <= 0) {
            // Dùng concat thay vì push để tránh lỗi
            fetchItems = fetchItems.concat({ ...item, id: item.catechist.id });
          }
        });

        // Chờ cho tất cả các promise hoàn thành
        await Promise.all(promises);
      };

      // Gọi hàm xử lý
      processItems().then(() => {
        // console.log(fetchItems);
        setCatechists(fetchItems);
      });

      // setCatechists(fetchItems);
    } catch (error) {
      console.error("Error loading catechists:", error);
    }
  };

  const handleConfirm = async () => {
    if (updateSlotMode) {
      try {
        enableLoading();
        if (selectedRoom) {
          classApi.updateRoomOfClass(
            selectedClass ? selectedClass.id : "",
            selectedRoom
          );
        }
        const updateCates = assignedCatechists.map((catechist: any) => ({
          catechistId: catechist.id,
          isMain: catechist.id === mainCatechistId,
        }));
        const updateRes = await classApi.updateCatechitsOfClass(
          selectedClass ? selectedClass.id : "",
          {
            catechists: updateCates,
          }
        );

        console.log(selectedClass ? selectedClass.id : "", {
          catechists: updateCates,
        });

        // setTimeout(() => {
        if (updateRes.data.statusCode.toString().startsWith("2")) {
          sweetAlert.alertSuccess(
            "Cập nhật tiết học thành công!",
            "",
            1000,
            22
          );
          setOpenSlotDialog(false);
          handleViewSlots(selectedClass ? selectedClass.id : "");
        }
        // }, 3000);
      } catch (error: any) {
        if (
          error.message &&
          error.message.includes("Không thể cập nhật khi bắt đầu niên khóa mới")
        ) {
          sweetAlert.alertFailed(
            "Không thể cập nhật khi bắt đầu niên khóa mới",
            "",
            5000,
            25
          );
        } else {
          sweetAlert.alertFailed(
            "Có lỗi xảy ra khi cập nhật tiết học!",
            "",
            1000,
            22
          );
        }
      } finally {
        disableLoading();
      }

      return;
    } else {
      if (!selectedRoom || assignedCatechists.length === 0) {
        sweetAlert.alertFailed(
          "Vui lòng chọn phòng và giáo lý viên!",
          "",
          1000,
          22
        );
        return;
      }

      const catechistsInClassData: CreateCatechistInClassRequest = {
        classId: selectedClass ? selectedClass.id : "",
        catechistIds: assignedCatechists.map((catechist) => catechist.id),
        mainCatechistId: mainCatechistId!,
      };

      const slotData: CreateSlotRequest = {
        classId: selectedClass ? selectedClass.id : "",
        roomId: selectedRoom,
        catechists: assignedCatechists.map((catechist) => ({
          catechistId: catechist.id,
          isMain: catechist.id === mainCatechistId,
        })),
      };

      try {
        enableLoading();
        await catechistInClassApi.createCatechistInClass(catechistsInClassData);
        await timetableApi.createSlot(slotData);
        sweetAlert.alertSuccess("Tạo tiết học thành công!", "", 1000, 22);
        setOpenSlotDialog(false);
        fetchClasses(); // Refresh classes
      } catch (error) {
        sweetAlert.alertFailed("Có lỗi xảy ra khi tạo tiết học!", "", 1000, 22);
      } finally {
        disableLoading();
      }
    }
  };

  const handleViewSlots = async (classId: string) => {
    try {
      const { data } = await classApi.getSlotsOfClass(classId);

      const sortedArray = data.data.items.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setSlots(sortedArray);

      setOpenSlotsDialog(true);
    } catch (error) {
      console.error("Error loading slots:", error);
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi tải thông tin slot!",
        "",
        1000,
        22
      );
    }
  };

  // Open Timetable Dialog
  const handleOpenTimetableDialog = () => {
    setOpenTimetableDialog(true);
  };

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      setFile(fileList[0]); // Lấy file đầu tiên
    }
  };

  // Confirm timetable upload
  const handleConfirmUpload = async () => {
    if (!file) {
      sweetAlert.alertFailed("Vui lòng chọn file!", "", 1000, 22);
      return;
    }

    try {
      enableLoading();
      await timetableApi.createTimetable(file); // Gọi API để tạo timetable
      sweetAlert.alertSuccess(
        "Thêm dữ liệu năm học mới thành công!",
        "",
        1000,
        23
      );
      setOpenTimetableDialog(false); // Đóng modal

      await fetchPastoralYears();
      await fetchMajors(); // Lấy danh sách các major
    } catch (error) {
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi tạo năm học mới!",
        "",
        1000,
        22
      );
    } finally {
      disableLoading();
    }
  };

  // Define columns for catechists table
  const columns1: GridColDef[] = [
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
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 200,
      renderCell: (params) => params.row.catechist.code,
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
      field: "assign",
      headerName: "Thêm",
      width: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddCatechist([params.row.catechist.id])}
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
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 200,
      renderCell: (params) => params.row.catechist.code,
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
          onClick={() => handleRemoveCatechist([params.row.id])}
        >
          Xóa
        </Button>
      ),
    },
    {
      field: "main",
      headerName: "Giáo lý viên chính",
      width: 120,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={mainCatechistId === params.row.id}
          onChange={() => {
            handleMainCatechistChange(params.row.id);
          }}
        />
      ),
    },
  ];

  const handleMainCatechistChange = (id: string) => {
    setMainCatechistId(id); // Update main catechist ID
  };

  // Handle selection change in DataGrid
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRows(newSelectionModel);
  };

  const handleLeaveRequestSubmit = async (
    catechistId: string,
    reason: string,
    slotId: string
  ) => {
    try {
      absenceApi.submitAbsence({
        catechistId: catechistId,
        reason: reason,
        slotId: slotId,
      });
      sweetAlert.alertSuccess("Tạo đơn nghỉ phép thành công", "", 1000, 22);
      setOpenLeaveDialog(false);
      // if (classViewSlotId != "") {
      //   fetchSlotForViewing(classViewSlotId);
      // }
    } catch (error) {
      console.error("Error loading slots:", error);
      sweetAlert.alertFailed("Lỗi khi tạo đơn nghỉ phép", "", 1000, 22);
    } finally {
    }
  };

  return (
    <Paper sx={{ width: "calc(100% - 3.8rem)", position: "absolute" }}>
      <h1 className="text-center text-[2.2rem] bg-primary_color text-text_primary_light py-2 font-bold">
        Danh sách lớp học
      </h1>

      <div className="my-2 flex justify-between mx-3">
        <div className="flex items-center justify-between w-full mt-1">
          <div className="flex gap-x-[5px]">
            {/* Select for Pastoral Year */}
            <FormControl
              fullWidth
              sx={{
                minWidth: 180,
                marginTop: 1.5,
                "& .MuiInputLabel-root": {
                  transform: "translateY(-20px)",
                  fontSize: "14px",
                  marginLeft: "8px",
                },
                "& .MuiSelect-select": {
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
              }}
            >
              <InputLabel>Chọn Niên Khóa</InputLabel>
              <Select
                value={selectedPastoralYear}
                onChange={(e) => {
                  setSelectedPastoralYear(e.target.value);
                  setSelectedMajor("all");
                  setSelectedGrade("all");
                }}
                displayEmpty
                required
              >
                {pastoralYears.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Select for Major */}
            <FormControl
              fullWidth
              sx={{
                minWidth: 180,
                marginTop: 1.5,
                "& .MuiInputLabel-root": {
                  transform: "translateY(-20px)",
                  fontSize: "14px",
                  marginLeft: "8px",
                },
                "& .MuiSelect-select": {
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
              }}
            >
              <InputLabel>Chọn Ngành</InputLabel>
              <Select
                value={selectedMajor}
                onChange={(e) => {
                  setSelectedMajor(e.target.value);
                  setSelectedGrade("all");
                }}
                displayEmpty
              >
                <MenuItem value="all" key="all">
                  Tất cả
                </MenuItem>
                {majors.map((major) => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedMajor && selectedMajor != "all" && (
              <FormControl
                fullWidth
                sx={{
                  minWidth: 180,
                  marginTop: 1.5,
                  "& .MuiInputLabel-root": {
                    transform: "translateY(-20px)",
                    fontSize: "14px",
                    marginLeft: "8px",
                  },
                  "& .MuiSelect-select": {
                    paddingTop: "10px",
                    paddingBottom: "10px",
                  },
                }}
              >
                <InputLabel>Chọn Khối</InputLabel>
                <Select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all" key="all">
                    Tất cả
                  </MenuItem>
                  {grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div className="flex gap-x-[5px]">
            <div>
              <Button
                onClick={handleOpenTimetableDialog} // Mở dialog thêm dữ liệu năm học mới
                variant="contained"
                color="primary"
                style={{ marginBottom: "16px" }}
              >
                Thêm dữ liệu năm học mới
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  const action = async () => {
                    try {
                      enableLoading();
                      const yearName = pastoralYears.find(
                        (item) => item.id == selectedPastoralYear
                      ).name;

                      const { data } =
                        await timetableApi.exportPastoralYearData(yearName);

                      // Tạo Blob từ response và sử dụng FileSaver để tải xuống file
                      const blob = new Blob([data], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      });
                      FileSaver.saveAs(
                        blob,
                        `Danh sách thông tin các lớp năm học ${yearName}.xlsx`
                      );
                    } catch (error) {
                      console.error("Lỗi khi xuất danh sách:", error);
                      sweetAlert.alertFailed(
                        "Có lỗi xảy ra khi xuất danh sách!",
                        "",
                        1000,
                        22
                      );
                    } finally {
                      disableLoading();
                    }
                  };
                  action();
                }}
                variant="contained"
                color="primary"
                style={{ marginBottom: "16px" }}
              >
                Xuất danh sách theo năm học
              </Button>
            </div>
            <div>
              <Button
                onClick={() => fetchClasses()}
                variant="contained"
                color="secondary"
                style={{ marginBottom: "16px" }}
              >
                Tải lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
        pageSizeOptions={[8, 25, 50]}
        checkboxSelection
        onRowSelectionModelChange={handleSelectionChange}
        rowSelectionModel={selectedRows} // Use selectedRows as controlled model
        sx={{
          border: 0,
        }}
        localeText={viVNGridTranslation}
        disableRowSelectionOnClick
      />

      {/* Dialog for creating Slot */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={openSlotDialog}
        onClose={() => setOpenSlotDialog(false)}
      >
        <div style={{ padding: "20px" }}>
          <h3 className="mb-3">
            <strong>
              {updateSlotMode ? "Cập nhật" : "Tạo"} tiết học cho{" "}
              {selectedClass?.name}
            </strong>
          </h3>
          <h4 className="mb-2">
            <strong>Phòng học</strong>
          </h4>
          <FormControl fullWidth>
            <InputLabel>
              {updateSlotMode
                ? "Chọn phòng học mới (nếu muốn cập nhật)"
                : "Chọn phòng học"}
            </InputLabel>
            <Select
              value={selectedRoom}
              onChange={(e) => {
                setSelectedRoom(e.target.value);
              }}
            >
              {rooms.map((room) => (
                <MenuItem
                  key={room.id}
                  value={room.id}
                  style={{ borderBottom: "1px solid gray" }}
                  className="mx-2"
                >
                  <div className="flex items-center">
                    {room.image && room.image != "" ? (
                      <img
                        src={room.image ?? ""}
                        alt={room.image ?? ""}
                        width={120}
                        height={120}
                        className="mr-3 rounded-sm"
                      />
                    ) : (
                      ""
                    )}
                    <p>
                      <strong>Tên phòng: </strong> {room.name}
                    </p>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <h4 className="mt-3 mb-1">
            <strong>Chọn giáo lý viên</strong>
            <span
              className={`${
                selectedClass && selectedClass.numberOfCatechist
                  ? `${selectedClass && assignedCatechists.length < selectedClass?.numberOfCatechist ? "text-danger" : "text-success"}`
                  : ""
              }`}
            >
              <strong>
                {" ("}Số lượng giáo lý viên cần thiết:{" "}
                {selectedClass?.numberOfCatechist}
                {") "}
              </strong>
            </span>
          </h4>
          {/* Bảng cho giáo lý viên chưa được gán */}
          <h5 className="mt-2 mb-1">
            <strong>Danh sách giáo lý viên chưa gán:</strong>
          </h5>
          <DataGrid
            rows={catechists}
            columns={columns1}
            paginationMode="server"
            rowCount={catechists.length}
            loading={loading}
            paginationModel={paginationModelCatechists}
            onPaginationModelChange={(newModel) =>
              setPaginationModelCatechists(newModel)
            }
            pageSizeOptions={[8, 25, 50]}
            checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) =>
              setSelectedRowsCatechists(newSelectionModel)
            }
            rowSelectionModel={selectedRowsCatechists} // Use selectedRowsCatechists as controlled model
            sx={{
              border: 0,
            }}
            localeText={viVNGridTranslation}
            disableRowSelectionOnClick
          />

          {/* Bảng cho giáo lý viên đã được gán */}
          <h5 className="mt-2 mb-1">
            {" "}
            <strong>
              Danh sách giáo lý viên đã gán.{" "}
              <span
                className={`${
                  selectedClass && selectedClass.numberOfCatechist
                    ? `${selectedClass && assignedCatechists.length < selectedClass?.numberOfCatechist ? "text-danger" : "text-success"}`
                    : ""
                }`}
              >
                Số lượng hiện tại: {assignedCatechists.length}
              </span>
            </strong>
          </h5>
          <DataGrid
            rows={assignedCatechists}
            columns={columns2}
            paginationMode="server"
            rowCount={assignedCatechists.length}
            loading={loading}
            paginationModel={paginationModelCatechists} // Use separate pagination model for assigned catechists
            onPaginationModelChange={(newModel) =>
              setPaginationModelCatechists(newModel)
            }
            pageSizeOptions={[8, 25, 50]}
            checkboxSelection
            onRowSelectionModelChange={(newSelectionModel) =>
              setSelectedRowsCatechists(newSelectionModel)
            }
            rowSelectionModel={selectedRowsCatechists} // Use selectedRowsCatechists as controlled model
            sx={{
              border: 0,
            }}
            localeText={viVNGridTranslation}
            disableRowSelectionOnClick
          />

          <div className="flex justify-end mt-3">
            <Button variant="contained" color="success" onClick={handleConfirm}>
              Xác nhận
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenSlotDialog(false)}
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog for viewing slots */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={openSlotsDialog}
        onClose={() => setOpenSlotsDialog(false)}
      >
        <div style={{ padding: "20px" }}>
          <h3>
            Thông tin các tiết học của{" "}
            {selectedClassView ? (
              <>
                <strong>{selectedClassView.name}</strong>
              </>
            ) : (
              <></>
            )}
          </h3>
          <div className="w-full flex justify-end">
            <Button
              variant="outlined"
              onClick={() => {
                handleOpenSlotDialog(selectedClassView, true);
              }}
            >
              Cập nhật các tiết học
            </Button>
          </div>
          <DataGrid
            rows={slots}
            columns={[
              {
                field: "roomName",
                headerName: "Phòng học",
                width: 180,
                renderCell: (params) => (
                  <div className="flex">
                    <img
                      src={params.row.room.image ?? ""}
                      alt=""
                      width={50}
                      height={50}
                      className="my-1 border-1 border-gray-400"
                      style={{ borderRadius: "2px" }}
                    />
                    <p className="ml-2">{params.row.room.name}</p>
                  </div>
                ),
              },
              {
                field: "date",
                headerName: "Ngày học",
                width: 130,
                renderCell: (params) => {
                  return (
                    <div>
                      <span
                        className={`rounded-md px-2 py-1
                      ${new Date().getTime() - new Date(params.row.date).getTime() >= 0 ? "bg-yellow-300" : ""}`}
                      >
                        {formatDate.DD_MM_YYYY(params.row.date)}
                      </span>
                    </div>
                  );
                },
              },
              {
                field: "time",
                headerName: "Giờ học",
                width: 130,
                renderCell: (params) =>
                  formatDate.HH_mm(params.row.startTime) +
                  " - " +
                  formatDate.HH_mm(params.row.endTime),
              },
              {
                field: "catechists",
                headerName: "Giáo lý viên",
                width: 500,
                renderCell: (params) => {
                  const priority: Record<CatechistInSlotTypeEnum, number> = {
                    [CatechistInSlotTypeEnum.Main]: 1,
                    [CatechistInSlotTypeEnum.Assistant]: 2,
                    [CatechistInSlotTypeEnum.Substitute]: 3,
                  };

                  return params.row.catechistInSlots
                    ? params.row.catechistInSlots
                        .sort(
                          (
                            a: { type: CatechistInSlotTypeEnum },
                            b: { type: CatechistInSlotTypeEnum }
                          ) => priority[a.type] - priority[b.type]
                        )
                        .map((item: any) =>
                          item.catechist
                            ? item.catechist.code +
                              ` (${
                                CatechistInSlotTypeEnumString[
                                  CatechistInSlotTypeEnum[
                                    item.type as keyof typeof CatechistInSlotTypeEnum
                                  ]
                                ]
                              })`
                            : ""
                        )
                        .join(", ")
                    : "";
                },
              },
              {
                field: "action",
                headerName: "Hành động",
                width: 250,
                renderCell: (params: any) => {
                  return new Date(params.row.date).getTime() -
                    new Date().getTime() >=
                    0 ? (
                    <Button
                      color="secondary"
                      variant="outlined"
                      onClick={() => {
                        setOpenLeaveDialog(true);
                        setSlotAbsenceId(params.row.id);
                        setAbsenceCatechistOptions(params.row.catechistInSlots);
                        setAbsenceDate(params.row.date);
                      }}
                    >
                      Tạo nghỉ phép
                    </Button>
                  ) : (
                    <></>
                  );
                },
              },
              // {
              //   field: "mainCatechist",
              //   headerName: "Giáo lý viên chính",
              //   width: 200,
              // },
            ]}
            paginationMode="server"
            rowCount={slots.length}
            sx={{
              border: 0,
            }}
            localeText={viVNGridTranslation}
          />
        </div>
        <AdminRequestLeaveDialog
          open={openLeaveDialog}
          slotId={slotAbsenceId}
          date={absenceDate}
          catechists={absenceCatechistOptions}
          onClose={() => setOpenLeaveDialog(false)} // Đóng dialog
          onSubmit={handleLeaveRequestSubmit} // Hàm xử lý khi gửi yêu cầu nghỉ phép
        />
      </Dialog>

      {/* Dialog for uploading timetable */}
      <Modal
        open={openTimetableDialog}
        onClose={() => setOpenTimetableDialog(false)}
      >
        <div
          style={{
            padding: "20px",
            width: "400px",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
        >
          <h2 className="mb-2">
            <strong>Thêm dữ liệu năm học mới</strong>
          </h2>
          <input type="file" accept=".xlsx" onChange={handleFileChange} />
          {/* {file && <p>{file.name}</p>}  */}
          {/* Hiển thị tên file đã chọn */}
          <div style={{ marginTop: "20px" }}>
            <Button
              onClick={handleConfirmUpload}
              variant="contained"
              color="primary"
            >
              Xác nhận
            </Button>
            <Button
              onClick={() => setOpenTimetableDialog(false)}
              variant="outlined"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Modal>
    </Paper>
  );
}
