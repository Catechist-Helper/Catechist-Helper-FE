import { useState, useEffect } from "react";
import {
  // useNavigate,
  useLocation,
  useNavigate,
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
  RadioGroup,
  FormControlLabel,
  Radio,
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
import CreateUpdateClassDialog from "./CreateUpdateClassDialog";
import { PATH_ADMIN } from "../../../routes/paths";

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

  const [optionRoomsUpdateSlot, setOptionRoomsUpdateSlot] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedRoomUpdateSlot, setSelectedRoomUpdateSlot] = useState<
    string | null
  >(null);
  const [assignedCatechists, setAssignedCatechists] = useState<any[]>([]); // Assigned catechists
  const [mainCatechistId, setMainCatechistId] = useState<string | null>(null); // ID of main catechist

  // States for catechists in Grade
  const [catechists, setCatechists] = useState<any[]>([]); // Catechists list for DataGrid

  const [slotUpdateAssignedCatechists, setSlotUpdateAssignedCatechists] =
    useState<any[]>([]); // Assigned catechists
  const [slotUpdateMainCatechistId, setSlotUpdateMainCatechistId] = useState<
    string | null
  >(null); // ID of main catechist

  // States for catechists in Grade
  const [slotUpdateCatechists, setSlotUpdateCatechists] = useState<any[]>([]);

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
  const [chosenSlotToUpdate, setChosenSlotToUpdate] = useState<any>(null);
  const [dialogUpdateSlotTime, setDialogUpdateSlotTime] =
    useState<boolean>(false);
  const [valueUpdateSlotTimeStart, setValueUpdateSlotTimeStart] =
    useState<string>("");
  const [valueUpdateSlotTimeEnd, setValueUpdateSlotTimeEnd] =
    useState<string>("");
  const [dialogUpdateSlotRoom, setDialogUpdateSlotRoom] =
    useState<boolean>(false);
  const [isDeletedCurrentRoom, setIsDeletedCurrentRoom] =
    useState<boolean>(false);
  const [isDeletedAllRoom, setIsDeletedAllRoom] = useState<boolean>(false);
  const [dialogUpdateSlotCatechist, setDialogUpdateSlotCatechist] =
    useState<boolean>(false);
  const [selectedClassView, setSelectedClassView] = useState<any>(null); // Loading state for slots
  const [openDialogCreateUpdateClass, setOpenDialogCreateUpdateClass] =
    useState<boolean>(false);
  const [openDialogUpdateClassMode, setOpenDialogUpdateClassMode] =
    useState<boolean>(false);

  useEffect(() => {
    if (!openDialogCreateUpdateClass) {
      setOpenDialogUpdateClassMode(false);
    }
  }, [openDialogCreateUpdateClass]);

  const handleOpenDialogCreateUpdateClass = (update?: boolean) => {
    if (update) {
      setOpenDialogUpdateClassMode(true);
    }
    setOpenDialogCreateUpdateClass(true);
  };

  const resetVietnamese = () => {
    let count = 1;
    let theInterval = setInterval(() => {
      const elements = document.querySelectorAll<HTMLElement>(
        ".MuiTablePagination-selectLabel"
      );
      if (elements) {
        elements.forEach((element) => {
          element.innerHTML = "Số hàng mỗi trang";
        });
      }

      const elements2 = document.querySelectorAll<HTMLElement>(
        ".MuiTablePagination-displayedRows"
      );
      if (elements2) {
        elements2.forEach((element2) => {
          let text = element2.innerHTML;
          text = text.replace(/\bof\b/g, "trong");
          element2.innerHTML = text;
        });
      }
      count++;
      if (count == 5) {
        clearInterval(theInterval);
      }
    }, 300);
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPastoralYears();
        if (location.state) {
          if (location.state.gradeId) {
            const { majorId, gradeId, defaultYear } = location.state;
            if (defaultYear && defaultYear != "") {
              setSelectedPastoralYear(defaultYear);
            }
            setSelectedMajor(majorId);
            await fetchGrades(majorId, gradeId);
          } else if (location.state.classIds) {
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
    if (!openSlotsDialog) {
      setMainCatechistId(null);
    }
  }, [openSlotsDialog]);

  useEffect(() => {
    if (selectedMajor && selectedMajor != "all" && selectedMajor != "") {
      fetchGrades(selectedMajor);
      setSelectedGrade("all");
    }
  }, [selectedMajor]);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên lớp", width: 150 },
    {
      field: "numberOfCatechist",
      headerName: "Số lượng giáo lý viên",
      width: 160,
      renderCell: (params) => {
        return (
          <span
            className={`${params.row.catechistCount && params.row.catechistCount >= params.row.numberOfCatechist ? "" : "text-danger"}`}
          >
            {`Hiện tại: ${params.row.catechistCount ? params.row.catechistCount : "0"} - Cần: ${params.row.numberOfCatechist}`}
          </span>
        );
      },
    },
    {
      field: "major",
      headerName: "Ngành",
      width: 110,
      renderCell: (params) => params.row.majorName,
    },
    {
      field: "grade",
      headerName: "Khối",
      width: 110,
      renderCell: (params) =>
        params.row.gradeName
          ? params.row.gradeName.includes("Khối")
            ? params.row.gradeName.split("Khối")[1]
            : params.row.gradeName
          : "",
    },
    {
      field: "startDate",
      headerName: "Ngày bắt đầu",
      width: 120,
      renderCell: (params: any) => {
        return formatDate.DD_MM_YYYY(params.value);
      },
    },
    {
      field: "endDate",
      headerName: "Ngày kết thúc",
      width: 120,
      renderCell: (params: any) => {
        return formatDate.DD_MM_YYYY(params.value);
      },
    },
    {
      field: "classStatus",
      headerName: "Trạng thái",
      width: 145,
      renderCell: (params) => {
        switch (params.value) {
          case ClassStatusEnum.Active:
            return (
              <span className="rounded-xl py-1 px-2 bg-warning text-black">
                {ClassStatusString.Active}
              </span>
            );
          case ClassStatusEnum.Finished:
            return (
              <span className="rounded-xl py-1 px-2 bg-success text-white">
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
      headerName: "Số tiết học",
      width: 365,
      renderCell: (params) => {
        return (
          <p>
            {params.row.slotCount <= 0 ? (
              <Button
                color="success"
                variant="contained"
                onClick={() => handleOpenSlotDialog(params.row)}
              >
                Tạo
              </Button>
            ) : (
              <>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => {
                    setSelectedClassView(params.row);
                    handleViewSlots(params.row.id);
                  }}
                  sx={{ marginRight: "10px" }}
                >
                  Xem
                </Button>
                {params.row.slotCount ? params.row.slotCount : ""}{" "}
                {params.row.slotMessage
                  ? "(" + params.row.slotMessage + ")"
                  : ""}
              </>
            )}
          </p>
        );
      },
    },
    {
      field: "export",
      headerName: "Danh sách",
      width: 90,
      renderCell: (params: any) => {
        return (
          <Button
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
                  FileSaver.saveAs(
                    blob,
                    `Danh sách thông tin tiết học của ${params.row.name}.xlsx`
                  );
                } catch (error) {
                  console.error("Lỗi khi xuất danh sách:", error);
                  sweetAlert.alertFailed(
                    "Có lỗi xảy ra khi xuất danh sách!",
                    "",
                    2500,
                    22
                  );
                } finally {
                  disableLoading();
                }
              };
              action();
            }}
          >
            Xuất
          </Button>
        );
      },
    },
    { field: "note", headerName: "Ghi chú", width: 90 },
  ];

  const fetchClasses = async (
    changeInitDate?: boolean,
    defaultGradeId?: string,
    classIds?: string[]
  ) => {
    try {
      setLoading(true);
      const firstRes = await classApi.getAllClasses(
        selectedMajor && selectedMajor != "all" ? selectedMajor : "",
        defaultGradeId
          ? defaultGradeId
          : selectedGrade && selectedGrade != "all"
            ? selectedGrade
            : "",
        selectedPastoralYear
      );
      const { data } = await classApi.getAllClasses(
        selectedMajor && selectedMajor != "all" ? selectedMajor : "",
        defaultGradeId
          ? defaultGradeId
          : selectedGrade && selectedGrade != "all"
            ? selectedGrade
            : "",
        selectedPastoralYear,
        1,
        firstRes.data.data.total
      );

      let filterDataByClassIds =
        classIds && classIds.length > 0
          ? data.data.items.filter(
              (item) => classIds.findIndex((id) => id == item.id) >= 0
            )
          : data.data.items;

      // filterDataByClassIds = [...filterDataByClassIds].sort((a,b)=>a.ma)

      const updatedRows = await Promise.all(
        filterDataByClassIds.map(async (classItem: any) => {
          const slotCount = await fetchSlotCountOfClass(classItem.id);
          const catechistCount = await fetchCatechistCountOfClass(classItem.id);
          return {
            ...classItem,
            slotCount: slotCount ? slotCount.slotCount : "N/A",
            slotMessage: slotCount ? slotCount.message : "N/A",
            catechistCount: catechistCount ? catechistCount.catechistCount : 0,
          };
        })
      );

      if (selectedClassView) {
        let newUpdateSelectedView = updatedRows.find(
          (item) => item.id == selectedClassView.id
        );
        if (newUpdateSelectedView != undefined) {
          setSelectedClassView(newUpdateSelectedView);
        }
      }

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
      let suffix = "";
      if (
        data.data.items.filter(
          (item) => !item.catechistInSlots || item.catechistInSlots.length <= 0
        ).length == data.data.items.length
      ) {
        suffix = "Chưa có giáo lý viên";
      }
      if (
        data.data.items.filter((item) => !item.room || !item.room.id).length ==
        data.data.items.length
      ) {
        if (suffix.trim() != "") {
          suffix += " - Chưa có phòng";
        } else {
          suffix = "Chưa có phòng";
        }
      }
      return {
        slotCount: data.data.total,
        message: suffix,
      };
    } catch (error) {
      console.error("Error loading grades:", error);
      return {
        slotCount: "N/A",
        message: "",
      };
    }
  };

  const fetchCatechistCountOfClass = async (classId: string) => {
    try {
      const { data } = await classApi.getCatechistsOfClass(classId, 1, 100);
      return {
        catechistCount: data.data.total,
      };
    } catch (error) {
      console.error("Error loading grades:", error);
      return {
        catechistCount: 0,
      };
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
      setSelectedPastoralYear(
        sortedPastoralYears[0] ? sortedPastoralYears[0].id : ""
      );
      if (!sortedPastoralYears[0]) {
        setLoading(false);
      }
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

  const handleAddCatechist = (
    selectedIds: string[],
    updateSlotMode?: boolean
  ) => {
    if (updateSlotMode) {
      const selectedUpdateCatechists = slotUpdateCatechists.filter(
        (catechist) => selectedIds.includes(catechist.id)
      );
      setSlotUpdateAssignedCatechists([
        ...slotUpdateAssignedCatechists,
        ...selectedUpdateCatechists,
      ]);
      setSlotUpdateCatechists(
        slotUpdateCatechists.filter(
          (catechist) => !selectedIds.includes(catechist.id)
        )
      );
      return;
    }

    const selectedCatechists = catechists.filter((catechist) =>
      selectedIds.includes(catechist.id)
    );
    setAssignedCatechists([...assignedCatechists, ...selectedCatechists]);
    setCatechists(
      catechists.filter((catechist) => !selectedIds.includes(catechist.id))
    ); // Remove from unassigned list
  };

  const handleRemoveCatechist = (
    selectedIds: string[],
    updateSlotMode?: boolean
  ) => {
    if (updateSlotMode) {
      const removedUpdateCatechists = slotUpdateAssignedCatechists.filter(
        (catechist) => !selectedIds.includes(catechist.id)
      );
      setSlotUpdateAssignedCatechists(removedUpdateCatechists);
      setSlotUpdateCatechists([
        ...slotUpdateCatechists,
        ...slotUpdateAssignedCatechists.filter((catechist) =>
          selectedIds.includes(catechist.id)
        ),
      ]);
      if (
        selectedIds.findIndex((item) => item == slotUpdateMainCatechistId) >= 0
      ) {
        setSlotUpdateMainCatechistId("");
      }
      return;
    }

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
    if (selectedIds.findIndex((item) => item == mainCatechistId)) {
      setMainCatechistId("");
    }
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
    }
    setOpenSlotDialog(true);
    resetVietnamese();
  };

  useEffect(() => {
    if (!openSlotDialog) {
      setSelectedRoom(null);
      setAssignedCatechists([]);
      setIsDeletedAllRoom(false);
    }
  }, [openSlotDialog]);

  useEffect(() => {
    if (chosenSlotToUpdate) {
      setIsDeletedCurrentRoom(false);
      setSelectedClass(selectedClassView);
      setValueUpdateSlotTimeStart(
        formatDate.HH_mm(chosenSlotToUpdate.startTime)
      );
      setValueUpdateSlotTimeEnd(formatDate.HH_mm(chosenSlotToUpdate.endTime));

      fetchRoomsUpdateSlot(chosenSlotToUpdate.id);
      fetchSlotUpdateCatechists(selectedClassView.gradeId);
    }
  }, [chosenSlotToUpdate]);

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

  const fetchRoomsUpdateSlot = async (slotId: string) => {
    try {
      const { data } = await roomApi.getAllRoom(
        1,
        1000,
        selectedPastoralYear,
        true,
        slotId
      );
      setOptionRoomsUpdateSlot(data.data.items);
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
        setCatechists(fetchItems);
      });

      // setCatechists(fetchItems);
    } catch (error) {
      console.error("Error loading catechists:", error);
    }
  };

  const fetchSlotUpdateCatechists = async (gradeId: string) => {
    try {
      const { data } = await gradeApi.getCatechistsOfGrade(
        gradeId,
        true,
        1,
        1000,
        selectedPastoralYear
      );

      const response =
        await catechistInClassApi.getAbsenceReplacementAvailableCatechists(
          selectedClassView ? selectedClassView.id : "",
          undefined
        );

      let fetchItems: any[] = [];

      const processItems = async () => {
        const promises = [...data.data.items].map(async (item) => {
          if (
            response.data.data.items.findIndex(
              (item2) => item2.id == item.catechist.id
            ) >= 0 &&
            chosenSlotToUpdate &&
            (!chosenSlotToUpdate.catechistInSlots ||
              chosenSlotToUpdate.catechistInSlots.findIndex(
                (item2: any) => item2.catechist.id == item.catechist.id
              ) < 0)
          ) {
            // Dùng concat thay vì push để tránh lỗi
            fetchItems = fetchItems.concat({ ...item, id: item.catechist.id });
          }
        });

        // Chờ cho tất cả các promise hoàn thành
        await Promise.all(promises);
      };

      // Gọi hàm xử lý
      processItems().then(() => {
        setSlotUpdateCatechists(fetchItems);
      });

      // setCatechists(fetchItems);
    } catch (error) {
      console.error("Error loading catechists:", error);
    }
  };

  const handleConfirm = async () => {
    if (
      (!selectedRoom || selectedRoom == "") &&
      !updateSlotMode &&
      !isDeletedAllRoom
    ) {
      sweetAlert.alertWarning("Vui lòng chọn phòng học", "", 3000, 22);
      return;
    }

    if (
      assignedCatechists.length > 0 &&
      selectedClass?.numberOfCatechist &&
      assignedCatechists.length < selectedClass?.numberOfCatechist
    ) {
      sweetAlert.alertWarning(
        `Chưa đủ số lượng giáo lý viên`,
        `
    Lớp ${selectedClass.name} cần ít nhất ${selectedClass.numberOfCatechist} giáo lý viên
    <br/>
    Số lượng hiện tại: ${assignedCatechists.length} `,
        8000,
        30
      );
      return;
    }

    if (mainCatechistId == "") {
      sweetAlert.alertWarning("Cần có 1 giáo lý viên chính trong tiết học");
      return;
    }

    if (updateSlotMode) {
      try {
        enableLoading();
        if (selectedRoom && !isDeletedAllRoom) {
          await classApi.updateRoomOfClass(
            selectedClass ? selectedClass.id : "",
            { roomId: selectedRoom }
          );
        }
        if (isDeletedAllRoom) {
          await classApi.updateRoomOfClass(
            selectedClass ? selectedClass.id : "",
            { isDeletedAllRoom: true }
          );
        }
        const updateCates = assignedCatechists.map((catechist: any) => ({
          catechistId: catechist.id,
          isMain: catechist.id === mainCatechistId,
        }));

        await classApi.updateCatechitsOfClass(
          selectedClass ? selectedClass.id : "",
          {
            catechists: updateCates,
          }
        );

        setTimeout(() => {
          sweetAlert.alertSuccess("Cập nhật tiết học thành công!");
          setOpenSlotDialog(false);
          handleViewSlots(selectedClass ? selectedClass.id : "");
          fetchClasses();
        }, 3000);
      } catch (error: any) {
        disableLoading();
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
          sweetAlert.alertFailed("Có lỗi xảy ra khi cập nhật tiết học!");
        }
      } finally {
        setTimeout(() => {
          disableLoading();
        }, 3800);
      }

      return;
    } else {
      const catechistsInClassData: CreateCatechistInClassRequest = {
        classId: selectedClass ? selectedClass.id : "",
        catechistIds: assignedCatechists.map((catechist) => catechist.id),
        mainCatechistId: mainCatechistId!,
      };

      const slotData: CreateSlotRequest = {
        classId: selectedClass ? selectedClass.id : "",
        roomId: selectedRoom ?? "",
        catechists: assignedCatechists.map((catechist) => ({
          catechistId: catechist.id,
          isMain: catechist.id === mainCatechistId,
        })),
      };

      try {
        enableLoading();
        await catechistInClassApi.createCatechistInClass(catechistsInClassData);
        await timetableApi.createSlot(slotData);
        sweetAlert.alertSuccess("Tạo tiết học thành công!");
        setOpenSlotDialog(false);
        fetchClasses(); // Refresh classes
      } catch (error) {
        sweetAlert.alertFailed("Có lỗi xảy ra khi tạo tiết học!");
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

      resetVietnamese();
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
    resetVietnamese();
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
        2500,
        30
      );

      setOpenTimetableDialog(false); // Đóng modal

      await fetchPastoralYears();
      await fetchMajors(); // Lấy danh sách các major
    } catch (error) {
      sweetAlert.alertFailed(
        "Có lỗi xảy ra khi tạo năm học mới!",
        "",
        2500,
        27
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
      width: 180,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 130,
      renderCell: (params) => params.row.catechist.code,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 90,
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

  const columnsUpdateSlot1: GridColDef[] = [
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
      width: 180,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 130,
      renderCell: (params) => params.row.catechist.code,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 90,
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
          onClick={() => handleAddCatechist([params.row.catechist.id], true)}
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
      width: 180,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 130,
      renderCell: (params) => params.row.catechist.code,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 90,
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
      width: 150,
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

  const columnsUpdateSlot2: GridColDef[] = [
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
      width: 180,
      renderCell: (params) => params.row.catechist.fullName,
    },
    {
      field: "code",
      headerName: "Mã giáo lý viên",
      width: 130,
      renderCell: (params) => params.row.catechist.code,
    },
    {
      field: "gender",
      headerName: "Giới tính",
      width: 90,
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
          onClick={() => handleRemoveCatechist([params.row.id], true)}
        >
          Xóa
        </Button>
      ),
    },
    {
      field: "main",
      headerName: "Giáo lý viên chính",
      width: 150,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={slotUpdateMainCatechistId === params.row.id}
          onChange={() => {
            handleMainCatechistChange(params.row.id, true);
          }}
        />
      ),
    },
  ];

  const handleMainCatechistChange = (id: string, updateSlotMode?: boolean) => {
    if (updateSlotMode) {
      setSlotUpdateMainCatechistId(id);
      return;
    }
    setMainCatechistId(id); // Update main catechist ID
  };

  // Handle selection change in DataGrid
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRows(newSelectionModel);
  };
  const navigate = useNavigate();
  const handleLeaveRequestSubmit = async (
    catechistId: string,
    reason: string,
    slotId: string,
    images: File[]
  ) => {
    try {
      enableLoading();
      await absenceApi.submitAbsence({
        catechistId: catechistId,
        reason: reason,
        slotId: slotId,
        requestImages: images,
      });
      sweetAlert.alertSuccess("Tạo đơn nghỉ phép thành công", "", 2500, 25);
      setOpenLeaveDialog(false);
      // if (classViewSlotId != "") {
      //   fetchSlotForViewing(classViewSlotId);
      // }
      navigate(PATH_ADMIN.admin_management_absence);
    } catch (error) {
      console.error("Error loading slots:", error);
      sweetAlert.alertFailed("Lỗi khi tạo đơn nghỉ phép", "", 2500, 25);
    } finally {
      disableLoading();
    }
  };

  const handleDeleteClass = async () => {
    try {
      enableLoading();
      const deletedClass = rows.find(
        (item) => item.id == selectedRows[0].toString()
      );

      const pastoralYear = pastoralYears.find(
        (item) => item.id == selectedPastoralYear
      );

      const confirm = await sweetAlert.confirm(
        `Xác nhận sẽ xóa \n${deletedClass.name}?`,
        `Ngành: ${deletedClass.majorName}
        </br> Khối: ${
          deletedClass.gradeName
            ? deletedClass.gradeName.includes("Khối")
              ? deletedClass.gradeName.split("Khối")[1]
              : deletedClass.gradeName
            : ""
        }
        </br> ${pastoralYear && pastoralYear.name ? `Niên khóa: ${pastoralYear.name}` : ``}
        </br> </br>Lưu ý: Khi xóa lớp sẽ xóa hết tất cả dữ liệu tiết học và giáo lý viên bên trong lớp`,
        undefined,
        undefined,
        "question"
      );
      if (!confirm) {
        return;
      }
      await classApi.deleteClass(deletedClass.id);
      sweetAlert.alertSuccess("Xoá thành công", "", 2500, 20);
      fetchClasses();
    } catch (error: any) {
      console.error("Error loading slots:", error);
      if (
        error &&
        error.message &&
        error.message.includes("Không thể xóa vì đã có slot")
      ) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa lớp",
          "Không thể xóa lớp này vì đã bắt đầu lớp học",
          5000,
          25
        );
      } else if (
        error &&
        error.message &&
        error.message.includes("Không thể xóa vì đã bắt đầu lớp học")
      ) {
        sweetAlert.alertFailed(
          "Có lỗi khi xóa lớp",
          "Không thể xóa lớp này vì đã bắt đầu lớp học",
          5000,
          25
        );
      } else {
        sweetAlert.alertFailed("Có lỗi khi xóa lớp", "", 2500, 22);
      }
    } finally {
      disableLoading();
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        left: "3.8rem",
        position: "absolute",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
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
            {selectedRows.length === 1 ? (
              <>
                <div>
                  <Button
                    onClick={() => {
                      handleDeleteClass();
                    }}
                    className="btn btn-danger"
                    variant="outlined"
                    color="error"
                    style={{ marginBottom: "16px" }}
                  >
                    Xóa
                  </Button>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      handleOpenDialogCreateUpdateClass(true);
                    }} // Mở dialog thêm dữ liệu năm học mới
                    variant="outlined"
                    color="warning"
                    className="btn btn-warning"
                    style={{ marginBottom: "16px" }}
                  >
                    Cập nhật
                  </Button>
                </div>
              </>
            ) : (
              <></>
            )}
            <div>
              <Button
                onClick={() => {
                  handleOpenDialogCreateUpdateClass();
                }} // Mở dialog thêm dữ liệu năm học mới
                variant="outlined"
                className="btn btn-success"
                color="success"
                style={{ marginBottom: "16px" }}
              >
                Tạo mới
              </Button>
            </div>
            <div>
              <Button
                onClick={handleOpenTimetableDialog} // Mở dialog thêm dữ liệu năm học mới
                variant="outlined"
                color="primary"
                className="btn btn-primary"
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
                        2500,
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
      <div className="px-3 w-full">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="client"
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          pageSizeOptions={[8, 25, 50]}
          onRowClick={() => {}}
          onRowSelectionModelChange={handleSelectionChange}
          rowSelectionModel={selectedRows}
          sx={{
            height: 530,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          localeText={viVNGridTranslation}
          checkboxSelection
          disableRowSelectionOnClick
          disableMultipleRowSelection
        />
      </div>

      {openDialogCreateUpdateClass ? (
        <>
          <CreateUpdateClassDialog
            rows={rows}
            open={openDialogCreateUpdateClass}
            onClose={() => {
              setOpenDialogCreateUpdateClass(false);
            }}
            pastoralYearId={selectedPastoralYear}
            pastoralYearName={
              pastoralYears.find((item) => item.id == selectedPastoralYear).name
            }
            classData={
              selectedRows.length === 1
                ? rows.find((item) => item.id == selectedRows[0].toString())
                : undefined
            }
            updateMode={openDialogUpdateClassMode}
            refresh={() => {
              fetchClasses();
            }}
          />
        </>
      ) : (
        <></>
      )}

      {/* Dialog for creating Slot */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={openSlotDialog}
        onClose={() => setOpenSlotDialog(false)}
      >
        <div style={{ padding: "20px" }}>
          <h3
            className={`mb-3 text-[1.2rem] ${updateSlotMode ? "text-primary" : "text-success"}`}
          >
            <strong>
              {updateSlotMode ? "Cập nhật" : "Tạo"} tiết học cho{" "}
              {selectedClass?.name}
            </strong>
          </h3>
          {selectedClassView &&
          selectedClassView.slotMessage &&
          selectedClassView.slotMessage
            .toLowerCase()
            .includes("chưa có phòng") ? (
            <></>
          ) : (
            <>
              <h4 className="mt-3 mb-1">
                <strong>Lựa chọn cập nhật phòng học</strong>
              </h4>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="isTeachingBefore"
                value={isDeletedAllRoom}
                onChange={(e) => {
                  if (e.target.value == "true") {
                    setIsDeletedAllRoom(true);
                  } else {
                    setIsDeletedAllRoom(false);
                  }
                }}
                sx={{ marginBottom: "10px" }}
              >
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Thay đổi sang phòng học mới"
                />
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Chỉ xóa phòng học hiện tại"
                />
              </RadioGroup>
            </>
          )}
          {!isDeletedAllRoom ? (
            <>
              <FormControl fullWidth>
                <InputLabel>
                  {updateSlotMode ? "Chọn phòng học " : "Chọn phòng học "}
                  {!updateSlotMode ? (
                    <span style={{ color: "red" }}>*</span>
                  ) : (
                    <></>
                  )}
                </InputLabel>
                <Select
                  value={selectedRoom}
                  onChange={(e) => {
                    setSelectedRoom(e.target.value);
                  }}
                  label={
                    <span>
                      {updateSlotMode ? "Chọn phòng học " : "Chọn phòng học "}
                      {!updateSlotMode ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : (
                        <></>
                      )}
                    </span>
                  }
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
            </>
          ) : (
            <></>
          )}

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
            paginationMode="client"
            rowCount={catechists.length}
            loading={loading}
            paginationModel={paginationModelCatechists}
            onPaginationModelChange={(newModel) =>
              setPaginationModelCatechists(newModel)
            }
            pageSizeOptions={[8, 25, 50]}
            // checkboxSelection
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
            paginationMode="client"
            rowCount={assignedCatechists.length}
            loading={loading}
            paginationModel={paginationModelCatechists} // Use separate pagination model for assigned catechists
            onPaginationModelChange={(newModel) =>
              setPaginationModelCatechists(newModel)
            }
            pageSizeOptions={[8, 25, 50]}
            // checkboxSelection
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

          <div className="flex justify-end mt-3 gap-x-2">
            <Button
              variant="outlined"
              color={updateSlotMode ? "primary" : "success"}
              onClick={() => setOpenSlotDialog(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              color={updateSlotMode ? "primary" : "success"}
              onClick={handleConfirm}
            >
              Xác nhận
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
          <h3 className="text-[1.2rem]">
            Thông tin các tiết học của{" "}
            {selectedClassView ? (
              <>
                <strong>{selectedClassView.name}</strong>
              </>
            ) : (
              <></>
            )}
          </h3>
          <div className="w-full flex justify-end mb-2">
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
                field: "no",
                headerName: "STT",
                width: 50,
                renderCell: (params) => {
                  {
                    const rowIndex =
                      params.api.getRowIndexRelativeToVisibleRows(
                        params.row.id
                      );
                    return rowIndex != null &&
                      rowIndex != undefined &&
                      rowIndex >= 0
                      ? rowIndex + 1
                      : 0;
                  }
                },
              },
              {
                field: "date",
                headerName: "Ngày học",
                width: 150,
                renderCell: (params) => {
                  return (
                    <div>
                      <span
                        className={`rounded-xl px-2 py-1
                      ${
                        formatDate.DD_MM_YYYY(
                          formatDate.getISODateInVietnamTimeZone()
                        ) == formatDate.DD_MM_YYYY(params.row.date)
                          ? "bg-blue-300"
                          : new Date().getTime() -
                                new Date(params.row.date).getTime() >=
                              0
                            ? "bg-yellow-300"
                            : ""
                      }`}
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
                width: 180,
                renderCell: (params) => (
                  <span>
                    {new Date(params.row.date).getTime() -
                      new Date().getTime() >=
                    0 ? (
                      <>
                        <i
                          className="mr-1 fa-solid fa-pen-to-square text-primary cursor-pointer"
                          onClick={() => {
                            setChosenSlotToUpdate(params.row);
                            setDialogUpdateSlotTime(true);
                          }}
                        ></i>
                      </>
                    ) : (
                      <></>
                    )}{" "}
                    {formatDate.HH_mm(params.row.startTime) +
                      " - " +
                      formatDate.HH_mm(params.row.endTime)}
                  </span>
                ),
              },
              {
                field: "roomName",
                headerName: "Phòng học",
                width: 220,
                renderCell: (params) => {
                  return params.row.room && params.row.room.name ? (
                    <div className="flex">
                      <p>
                        {new Date(params.row.date).getTime() -
                          new Date().getTime() >=
                        0 ? (
                          <>
                            <i
                              style={{
                                display:
                                  selectedClassView &&
                                  selectedClassView.slotMessage &&
                                  selectedClassView.slotMessage
                                    .toLowerCase()
                                    .includes("chưa có phòng")
                                    ? "none"
                                    : "",
                              }}
                              className="mr-3 fa-solid fa-pen-to-square text-primary cursor-pointer"
                              onClick={() => {
                                setChosenSlotToUpdate(params.row);
                                setDialogUpdateSlotRoom(true);
                              }}
                            ></i>
                          </>
                        ) : (
                          <></>
                        )}
                      </p>
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
                  ) : (
                    <p className="ml-1">
                      {new Date(params.row.date).getTime() -
                        new Date().getTime() >=
                      0 ? (
                        <>
                          <i
                            style={{
                              display:
                                selectedClassView &&
                                selectedClassView.slotMessage &&
                                selectedClassView.slotMessage
                                  .toLowerCase()
                                  .includes("chưa có phòng")
                                  ? "none"
                                  : "",
                            }}
                            className="mr-3 fa-solid fa-pen-to-square text-primary cursor-pointer"
                            onClick={() => {
                              setChosenSlotToUpdate(params.row);
                              setDialogUpdateSlotRoom(true);
                            }}
                          ></i>
                        </>
                      ) : (
                        <></>
                      )}
                      Chưa có
                    </p>
                  );
                },
              },
              {
                field: "catechists",
                headerName: "Giáo lý viên",
                width: 300,
                renderCell: (params) => {
                  const priority: Record<CatechistInSlotTypeEnum, number> = {
                    [CatechistInSlotTypeEnum.Main]: 1,
                    [CatechistInSlotTypeEnum.Assistant]: 2,
                    [CatechistInSlotTypeEnum.Substitute]: 3,
                  };

                  return params.row.catechistInSlots &&
                    params.row.catechistInSlots.length > 0 ? (
                    <span>
                      {new Date(params.row.date).getTime() -
                        new Date().getTime() >=
                      0 ? (
                        <>
                          <i
                            className="mr-2 fa-solid fa-pen-to-square text-primary cursor-pointer"
                            style={{
                              display:
                                selectedClassView &&
                                selectedClassView.catechistCount &&
                                selectedClassView.catechistCount <= 0
                                  ? "none"
                                  : "",
                            }}
                            onClick={() => {
                              setChosenSlotToUpdate(params.row);
                              resetVietnamese();
                              setDialogUpdateSlotCatechist(true);
                              const action = async () => {
                                try {
                                  enableLoading();
                                  // await fetchSlotUpdateCatechists(
                                  //   selectedClassView.gradeId
                                  // );

                                  const { data } =
                                    await gradeApi.getCatechistsOfGrade(
                                      selectedClassView.gradeId,
                                      false,
                                      1,
                                      1000,
                                      selectedPastoralYear
                                    );

                                  let fetchItems: any[] = []; // Đảm bảo mảng là extensible

                                  const processItems = async () => {
                                    const promises = [...data.data.items].map(
                                      async (item) => {
                                        const cateSlotExist =
                                          params.row.catechistInSlots.find(
                                            (item2: any) =>
                                              item2.catechist.id ==
                                              item.catechist.id
                                          );

                                        if (cateSlotExist != undefined) {
                                          fetchItems = fetchItems.concat({
                                            ...item,
                                            id: item.catechist.id,
                                          });
                                          if (
                                            cateSlotExist.type ==
                                            CatechistInSlotTypeEnum.Main
                                          ) {
                                            setSlotUpdateMainCatechistId(
                                              cateSlotExist.catechist.id
                                            );
                                          }
                                        }
                                      }
                                    );

                                    // Chờ cho tất cả các promise hoàn thành
                                    await Promise.all(promises);
                                  };

                                  // Gọi hàm xử lý
                                  processItems().then(() => {
                                    setSlotUpdateAssignedCatechists(fetchItems);
                                  });

                                  // setCatechists(fetchItems);
                                } catch (error) {
                                  console.error(
                                    "Error loading catechists:",
                                    error
                                  );
                                } finally {
                                  disableLoading();
                                }
                              };
                              action();
                            }}
                          ></i>
                        </>
                      ) : (
                        <></>
                      )}
                      {params.row.catechistInSlots
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
                        .join(", ")}{" "}
                    </span>
                  ) : (
                    <span>
                      {new Date(params.row.date).getTime() -
                        new Date().getTime() >=
                      0 ? (
                        <>
                          <i
                            className="mr-2 fa-solid fa-pen-to-square text-primary cursor-pointer"
                            style={{
                              display:
                                selectedClassView &&
                                ((selectedClassView.catechistCount &&
                                  selectedClassView.catechistCount <= 0) ||
                                  !selectedClassView.catechistCount)
                                  ? "none"
                                  : "",
                            }}
                            onClick={() => {
                              // const action = async () => {
                              //   fetchSlotUpdateCatechists(
                              //     selectedClassView.gradeId
                              //   );
                              // };
                              // action();
                              setChosenSlotToUpdate(params.row);
                              setDialogUpdateSlotCatechist(true);
                            }}
                          ></i>
                        </>
                      ) : (
                        <></>
                      )}
                      Chưa có giáo lý viên
                    </span>
                  );
                },
              },
              {
                field: "action",
                headerName: "Hành động",
                width: 180,
                renderCell: (params: any) => {
                  return (
                    <>
                      {new Date(params.row.date).getTime() -
                        new Date().getTime() >=
                        0 &&
                      params.row.catechistInSlots &&
                      params.row.catechistInSlots.length > 0 ? (
                        <Button
                          color="secondary"
                          variant="outlined"
                          onClick={() => {
                            resetVietnamese();
                            setOpenLeaveDialog(true);
                            setSlotAbsenceId(params.row.id);
                            setAbsenceCatechistOptions(
                              params.row.catechistInSlots
                            );
                            setAbsenceDate(params.row.date);
                          }}
                        >
                          Tạo nghỉ phép
                        </Button>
                      ) : (
                        <></>
                      )}
                    </>
                  );
                },
              },
              // {
              //   field: "mainCatechist",
              //   headerName: "Giáo lý viên chính",
              //   width: 200,
              // },
            ]}
            paginationMode="client"
            rowCount={slots.length}
            localeText={viVNGridTranslation}
            sx={{
              height: 555,
              overflowX: "auto",
              "& .MuiDataGrid-root": {
                overflowX: "auto",
              },
            }}
            disableRowSelectionOnClick
          />
          <div className="flex justify-end mt-3">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setOpenSlotsDialog(false);
              }}
            >
              Đóng
            </Button>
          </div>
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

      <Dialog fullWidth maxWidth="sm" open={dialogUpdateSlotTime}>
        <div style={{ padding: "20px" }}>
          <h3 className={`mb-3 text-[1.2rem] text-primary`}>
            <strong>Cập nhật giờ học</strong>
          </h3>

          <div className="flex justify-between flex-wrap">
            {selectedClass ? (
              <>
                <div className="w-[45%] my-2">
                  <strong>Lớp học:</strong> {selectedClass.name}
                </div>
              </>
            ) : (
              <></>
            )}
            {chosenSlotToUpdate ? (
              <>
                <div className="w-[50%] my-2">
                  <strong>Ngày học:</strong>{" "}
                  {formatDate.DD_MM_YYYY(chosenSlotToUpdate.date)}
                </div>

                <div className="w-[45%] my-2">
                  <strong>Giờ học:</strong>{" "}
                  {formatDate.HH_mm(chosenSlotToUpdate.startTime)} -{" "}
                  {formatDate.HH_mm(chosenSlotToUpdate.endTime)}
                </div>

                {chosenSlotToUpdate.room ? (
                  <>
                    <div className="w-[50%] my-2">
                      <strong>Phòng học:</strong> {chosenSlotToUpdate.room.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[50%] my-2">
                      <strong>Phòng học:</strong> Chưa có
                    </div>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </div>
          <p className="mt-1 mb-1">
            <strong>Cập nhật giờ học mới</strong>
          </p>
          <div className="flex justify-between w-full h-full gap-x-5">
            <div className="w-[48%]">
              <label className="mb-[3px] mt-[2px]" htmlFor="">
                Thời gian bắt đầu <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="value"
                name="value"
                type="time"
                className="bg-gray-50 border border-black text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={(e) => {
                  setValueUpdateSlotTimeStart(e.target.value);
                }}
                value={valueUpdateSlotTimeStart}
              />
            </div>
            <div className="w-[48%]">
              <label className="mb-[3px] mt-[2px]" htmlFor="">
                Thời gian kết thúc <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="value"
                name="value"
                type="time"
                className="bg-gray-50 border border-black text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                onChange={(e) => {
                  setValueUpdateSlotTimeEnd(e.target.value);
                }}
                value={valueUpdateSlotTimeEnd}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-x-2">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDialogUpdateSlotTime(false);
                setChosenSlotToUpdate(null);
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              color={"primary"}
              onClick={() => {
                const action = async () => {
                  if (
                    valueUpdateSlotTimeStart != "" &&
                    valueUpdateSlotTimeEnd != "" &&
                    valueUpdateSlotTimeEnd <= valueUpdateSlotTimeStart
                  ) {
                    sweetAlert.alertWarning(
                      "Thời gian kết thúc phải sau thời gian bắt đầu"
                    );
                    return;
                  }

                  try {
                    enableLoading();
                    await classApi.updateSlotOfClass(chosenSlotToUpdate.id, {
                      startTime:
                        chosenSlotToUpdate.date.toString().split("T")[0] +
                        "T" +
                        valueUpdateSlotTimeStart,
                      endTime:
                        chosenSlotToUpdate.date.toString().split("T")[0] +
                        "T" +
                        valueUpdateSlotTimeEnd,
                    });

                    setTimeout(() => {
                      setDialogUpdateSlotTime(false);
                      setChosenSlotToUpdate(null);
                      handleViewSlots(selectedClass ? selectedClass.id : "");
                      sweetAlert.alertSuccess("Cập nhật thành công");
                    }, 200);
                  } catch (error) {
                    console.error("Lỗi khi tải", error);
                    sweetAlert.alertFailed("Có lỗi khi cập nhật");
                  } finally {
                    setTimeout(() => {
                      disableLoading();
                    }, 200);
                  }
                };
                action();
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" open={dialogUpdateSlotRoom}>
        <div style={{ padding: "20px" }}>
          <h3 className={`mb-3 text-[1.2rem] text-primary`}>
            <strong>Cập nhật phòng học</strong>
          </h3>
          <div className="flex justify-between flex-wrap">
            {selectedClass ? (
              <>
                <div className="w-[45%] my-2">
                  <strong>Lớp học:</strong> {selectedClass.name}
                </div>
              </>
            ) : (
              <></>
            )}
            {chosenSlotToUpdate ? (
              <>
                <div className="w-[50%] my-2">
                  <strong>Ngày học:</strong>{" "}
                  {formatDate.DD_MM_YYYY(chosenSlotToUpdate.date)}
                </div>

                <div className="w-[45%] my-2">
                  <strong>Giờ học:</strong>{" "}
                  {formatDate.HH_mm(chosenSlotToUpdate.startTime)} -{" "}
                  {formatDate.HH_mm(chosenSlotToUpdate.endTime)}
                </div>

                {chosenSlotToUpdate.room ? (
                  <>
                    <div className="w-[50%] my-2">
                      <strong>Phòng học:</strong> {chosenSlotToUpdate.room.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[50%] my-2">
                      <strong>Phòng học:</strong> Chưa có
                    </div>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </div>

          <p className="mt-1 mb-1">
            <strong>Lựa chọn cập nhật phòng học</strong>
          </p>
          {chosenSlotToUpdate && chosenSlotToUpdate.room ? (
            <>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="isTeachingBefore"
                value={isDeletedCurrentRoom}
                onChange={(e) => {
                  if (e.target.value == "true") {
                    setIsDeletedCurrentRoom(true);
                  } else {
                    setIsDeletedCurrentRoom(false);
                  }
                }}
              >
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Thay đổi sang phòng học mới"
                />
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Chỉ xóa phòng học hiện tại"
                />
              </RadioGroup>
            </>
          ) : (
            <></>
          )}
          {!isDeletedCurrentRoom ? (
            <>
              <FormControl
                fullWidth
                sx={{ marginTop: "15px", marginBottom: "15px" }}
              >
                <InputLabel>
                  <span>
                    Chọn phòng học <span style={{ color: "red" }}>*</span>
                  </span>
                </InputLabel>
                <Select
                  value={selectedRoomUpdateSlot}
                  onChange={(e) => {
                    setSelectedRoomUpdateSlot(e.target.value);
                  }}
                  label={
                    <span>
                      Chọn phòng học <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                >
                  {optionRoomsUpdateSlot.map((room) => (
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
            </>
          ) : (
            <></>
          )}

          <div className="flex justify-end mt-3 gap-x-2">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDialogUpdateSlotRoom(false);
                setChosenSlotToUpdate(null);
                setSelectedRoomUpdateSlot(null);
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              color={"primary"}
              onClick={() => {
                const action = async () => {
                  try {
                    enableLoading();
                    if (isDeletedCurrentRoom) {
                      await classApi.updateSlotOfClass(chosenSlotToUpdate.id, {
                        isDeletedRoom: isDeletedCurrentRoom,
                      });
                    } else {
                      if (
                        !selectedRoomUpdateSlot ||
                        selectedRoomUpdateSlot == ""
                      ) {
                        sweetAlert.alertWarning(
                          "Vui lòng chọn 1 phòng học để cập nhật"
                        );
                        return;
                      }
                      await classApi.updateSlotOfClass(chosenSlotToUpdate.id, {
                        roomId: selectedRoomUpdateSlot,
                      });
                    }

                    setTimeout(() => {
                      setDialogUpdateSlotRoom(false);
                      setChosenSlotToUpdate(null);
                      handleViewSlots(selectedClass ? selectedClass.id : "");
                      sweetAlert.alertSuccess("Cập nhật thành công");
                    }, 200);
                  } catch (error) {
                    console.error("Lỗi khi tải", error);
                    sweetAlert.alertFailed("Có lỗi khi cập nhật");
                  } finally {
                    setTimeout(() => {
                      disableLoading();
                      setSelectedRoomUpdateSlot(null);
                    }, 200);
                  }
                };
                action();
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog fullWidth maxWidth="lg" open={dialogUpdateSlotCatechist}>
        <div style={{ padding: "20px" }}>
          <h3 className={`mb-3 text-[1.2rem] text-primary`}>
            <strong>Cập nhật giáo lý viên</strong>
          </h3>

          <div className="flex justify-between flex-wrap">
            {selectedClass ? (
              <>
                <div className="w-[45%] my-2">
                  <strong>Lớp học:</strong> {selectedClass.name}
                </div>
              </>
            ) : (
              <></>
            )}
            {chosenSlotToUpdate ? (
              <>
                <div className="w-[50%] my-2">
                  <strong>Ngày học:</strong>{" "}
                  {formatDate.DD_MM_YYYY(chosenSlotToUpdate.date)}
                </div>

                <div className="w-[45%] my-2">
                  <strong>Giờ học:</strong>{" "}
                  {formatDate.HH_mm(chosenSlotToUpdate.startTime)} -{" "}
                  {formatDate.HH_mm(chosenSlotToUpdate.endTime)}
                </div>

                {chosenSlotToUpdate.room ? (
                  <>
                    <div className="w-[50%] my-2">
                      <strong>Phòng học:</strong> {chosenSlotToUpdate.room.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[50%] my-2">
                      <strong>Phòng học:</strong> Chưa có
                    </div>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </div>

          <h4 className="mt-3 mb-1">
            <strong>Chọn giáo lý viên</strong>
            <span
              className={`${
                selectedClass && selectedClass.numberOfCatechist
                  ? `${selectedClass && slotUpdateAssignedCatechists.length < selectedClass?.numberOfCatechist ? "text-danger" : "text-success"}`
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
            <strong>Danh sách giáo lý viên có thể gán:</strong>
          </h5>
          <DataGrid
            rows={slotUpdateCatechists}
            columns={columnsUpdateSlot1}
            paginationMode="client"
            rowCount={slotUpdateCatechists.length}
            loading={loading}
            paginationModel={paginationModelCatechists}
            onPaginationModelChange={(newModel) =>
              setPaginationModelCatechists(newModel)
            }
            pageSizeOptions={[8, 25, 50]}
            // checkboxSelection
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
                    ? `${selectedClass && slotUpdateAssignedCatechists.length < selectedClass?.numberOfCatechist ? "text-danger" : "text-success"}`
                    : ""
                }`}
              >
                Số lượng hiện tại: {slotUpdateAssignedCatechists.length}
              </span>
            </strong>
          </h5>
          <DataGrid
            rows={slotUpdateAssignedCatechists}
            columns={columnsUpdateSlot2}
            paginationMode="client"
            rowCount={slotUpdateAssignedCatechists.length}
            loading={loading}
            paginationModel={paginationModelCatechists} // Use separate pagination model for assigned catechists
            onPaginationModelChange={(newModel) =>
              setPaginationModelCatechists(newModel)
            }
            pageSizeOptions={[8, 25, 50]}
            // checkboxSelection
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

          <div className="flex justify-end mt-3 gap-x-2">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDialogUpdateSlotCatechist(false);
                setChosenSlotToUpdate(null);
                setSlotUpdateMainCatechistId("");
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              color={"primary"}
              onClick={() => {
                const action = async () => {
                  if (slotUpdateAssignedCatechists.length <= 0) {
                    sweetAlert.alertWarning(
                      "Vui lòng chọn ít nhất 1 giáo lý viên để gán"
                    );
                    return;
                  } else if (slotUpdateMainCatechistId == "") {
                    sweetAlert.alertWarning(
                      "Cần có 1 giáo lý viên chính trong tiết học"
                    );
                    return;
                  }
                  try {
                    enableLoading();
                    const updateCates = slotUpdateAssignedCatechists.map(
                      (catechist: any) => ({
                        catechistId: catechist.id,
                        isMain: catechist.id === slotUpdateMainCatechistId,
                      })
                    );

                    await classApi.updateSlotOfClass(chosenSlotToUpdate.id, {
                      catechistInSlots: updateCates,
                    });

                    setTimeout(() => {
                      setDialogUpdateSlotCatechist(false);
                      setChosenSlotToUpdate(null);
                      setSlotUpdateMainCatechistId("");
                      handleViewSlots(selectedClass ? selectedClass.id : "");
                      sweetAlert.alertSuccess("Cập nhật thành công");
                    }, 200);
                  } catch (error) {
                    console.error("Lỗi khi tải", error);
                    sweetAlert.alertFailed("Có lỗi khi cập nhật");
                  } finally {
                    setTimeout(() => {
                      disableLoading();
                    }, 200);
                  }
                };
                action();
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
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
          <div className="flex gap-x-2" style={{ marginTop: "20px" }}>
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
