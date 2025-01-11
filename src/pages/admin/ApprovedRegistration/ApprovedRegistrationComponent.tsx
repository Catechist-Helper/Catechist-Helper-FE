import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Modal,
  Dialog,
  Button,
  Select as MuiSelect,
  MenuItem,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";
import RegistrationDetailDialog from "./RegistrationDetailDialog";
import Select from "react-select";
import dayjs from "dayjs";
import registrationApi from "../../../api/Registration";
import interviewApi from "../../../api/Interview";
import interviewProcessApi from "../../../api/InterviewProcess";
import accountApi from "../../../api/Account";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import sweetAlert from "../../../utils/sweetAlert";
import { formatDate } from "../../../utils/formatDate";
import useAppContext from "../../../hooks/useAppContext";
import CreateAccountAndCatechistDialog from "./CreateAccountAndCatechistDialog";
import {
  RegistrationProcessStatus,
  RegistrationProcessTitle,
} from "../../../enums/RegistrationProcess";
import { RoleNameEnum } from "../../../enums/RoleEnum";
import CkEditor from "../../../components/ckeditor5/CkEditor";
import { RecruitersByMeetingTimeItemResponse } from "../../../model/Response/Account";
import catechistApi from "../../../api/Catechist";
import { storeCurrentPath } from "../../../utils/utils";
import { PATH_ADMIN } from "../../../routes/paths";

// import { RegistrationProcessTitle } from "../../../enums/RegistrationProcess";

// Cấu hình các cột trong DataGrid

// Hàm chính để hiển thị danh sách đơn
export default function ApprovedRegistrationsTable() {
  const { enableLoading, disableLoading } = useAppContext();
  const [rows, setRows] = useState<RegistrationItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedRegistrations, setSelectedRegistrations] =
    useState<GridRowSelectionModel>([]); // Chọn nhiều đơn

  // Modal state cho phê duyệt phỏng vấn
  const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
  const [interviewNote, setInterviewNote] = useState<string>(""); // Ghi chú phỏng vấn
  const [interviewResult, setInterviewResult] = useState<string>(""); // Kết quả phỏng vấn
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationItemResponse | null>(null); // Đơn đăng ký được chọn
  const [selectedRegistrationOfModal, setSelectedRegistrationOfModal] =
    useState<RegistrationItemResponse | null>(null);

  // Modal state cho cập nhật phỏng vấn
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  // const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedRecruiters, setSelectedRecruiters] = useState<any[]>([]);
  const [meetingTime, setMeetingTime] = useState<string>("");
  const [recruiters, setRecruiters] = useState<any[]>([]); // Lưu danh sách recruiter
  const [updatedInterviewReason, setUpdatedInterviewReason] =
    useState<string>("");
  const [interviewTypeOption, setInterviewTypeOption] = useState<number>(-1);

  // const [deletedInterviewReason, setDeletedInterviewReason] =
  //   useState<string>("");

  // State cho loại đơn hiện tại
  const [currentFilter, setCurrentFilter] = useState<string>("waiting");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openDialogRegisDetail, setOpenDialogRegisDetail] =
    useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any[]>([]);
  const [previewAccounts, setPreviewAccounts] = useState<
    RecruitersByMeetingTimeItemResponse[]
  >([]);

  const columns: GridColDef[] = [
    { field: "fullName", headerName: "Tên đầy đủ", width: 180 },
    { field: "gender", headerName: "Giới tính", width: 100 },
    {
      field: "dateOfBirth",
      headerName: "Ngày sinh",
      width: 110,
      renderCell: (params) => {
        return formatDate.DD_MM_YYYY(params.value); // Format ngày tháng
      },
    },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Số điện thoại", width: 120 },
    { field: "address", headerName: "Địa chỉ", width: 180 },
    {
      field: "isTeachingBefore",
      headerName: "Đã từng dạy",
      width: 120,
      renderCell: (params) => (params.value ? "Có" : "Không"),
    },
    { field: "yearOfTeaching", headerName: "Số năm giảng dạy", width: 150 },
    {
      field: "meetingTime",
      headerName: "Thời gian phỏng vấn",
      width: 180,
      renderCell: (params) => {
        return params.row.interview
          ? formatDate.DD_MM_YYYY_Time(params.row.interview.meetingTime)
          : "Chưa có lịch";
      },
      sortComparator: (a, b) => {
        if (!a || !b) return 0;
        return dayjs(a).isBefore(dayjs(b)) ? -1 : 1; // Sắp xếp theo ngày giờ từ sớm tới muộn
      },
    },
    {
      field: "interviewType",
      headerName: "Hình thức",
      width: 100,
      renderCell: (params) => {
        return params.row.interview &&
          params.row.interview.interviewType == 1 ? (
          <span className="text-white bg-success rounded-xl py-1 px-2">
            Online
          </span>
        ) : (
          <span className="text-white bg-black rounded-xl py-1 px-2">
            Trực tiếp
          </span>
        );
      },
      sortComparator: (a, b) => {
        if (!a || !b) return 0;
        return dayjs(a).isBefore(dayjs(b)) ? -1 : 1; // Sắp xếp theo ngày giờ từ sớm tới muộn
      },
    },
    {
      field: "interview.recruiters",
      headerName: "Người phỏng vấn",
      width: 200,
      renderCell: (params) => {
        return params.row.interview && params.row.interview.recruiters
          ? params.row.interview.recruiters
              .map((recruiter: any) => recruiter.fullName)
              .join(", ")
          : "";
      },
    },
    {
      field: "note",
      headerName: "Ghi chú",
      width: 200,
      renderCell: (params) =>
        params.value ? params.value.replace("\n", ".") : "",
    },
    // {
    //   field: "interviews",
    //   headerName: "Kết quả phỏng vấn",
    //   width: 200,
    //   renderCell: (params) => {
    //     return params.row.interview?.note || ""; // Hiển thị ghi chú nếu có
    //   },
    // },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params) => {
        const status = params.value as RegistrationStatus;
        switch (status) {
          case RegistrationStatus.Approved_Duyet_Don:
            return (
              <span className="inline px-2 py-1 bg-info text-text_primary_dark rounded-lg">
                Chờ phỏng vấn
              </span>
            );
          case RegistrationStatus.Approved_Phong_Van:
            return (
              <span className="inline px-2 py-1 bg-success text-text_primary_light rounded-lg">
                Đã chấp nhận
              </span>
            );
          case RegistrationStatus.Rejected_Phong_Van:
            return (
              <span className="inline px-2 py-1 bg-danger rounded-lg text-text_primary_light">
                Bị từ chối
              </span>
            );
          default:
            return "Không xác định";
        }
      },
      // renderCell: () => {
      //   return (
      //     <span className="inline px-2 py-1 bg-info rounded-lg">
      //       Chờ phỏng vấn
      //     </span>
      //   );
      // },
    },
  ];

  // Lấy danh sách accounts (recruiters)
  const fetchRecruiters = async () => {
    try {
      setRecruiters([]);
      const firstRes = await accountApi.getAllAccounts(1, 10000);

      const { data } = await accountApi.getAllAccounts(
        1,
        firstRes.data.data.total
      );

      const firstCateRes = await catechistApi.getAllCatechists();
      const cateRes = await catechistApi.getAllCatechists(
        1,
        firstCateRes.data.data.total
      );
      data.data.items
        .filter(
          (item: any) =>
            !item.isDeleted && item.role.roleName == RoleNameEnum.Catechist
        )
        .forEach((item) => {
          const action = async () => {
            const cate = cateRes.data.data.items.find(
              (cate) => cate.account.id == item.id
            );
            if (cate) {
              setRecruiters((prev) => [...prev, { ...item, cate: cate }]);
            }
          };
          action();
        });
    } catch (error) {
      console.error("Lỗi khi tải danh sách accounts:", error);
    }
  };

  // Fetch các đơn đã duyệt dựa trên trạng thái và lọc theo ngày
  const fetchApprovedRegistrations = async (
    deleteModeOn?: boolean | string
  ) => {
    try {
      setLoading(true);

      // Xác định giá trị status dựa trên bộ lọc hiện tại
      let status;
      switch (currentFilter) {
        case "accepted":
          status = RegistrationStatus.Approved_Phong_Van;
          break;
        case "rejected":
          status = RegistrationStatus.Rejected_Phong_Van;
          break;
        default:
          status = RegistrationStatus.Approved_Duyet_Don;
          break;
      }

      // Gọi API getAllRegistrations với các tham số
      const firstResponse = await registrationApi.getAllRegistrations(
        undefined,
        undefined,
        status
      );

      const { data } = await registrationApi.getAllRegistrations(
        undefined,
        undefined,
        status,
        1,
        firstResponse.data.data.total
      );

      let finalData = data.data.items
        .sort((a: RegistrationItemResponse, b: RegistrationItemResponse) => {
          if (
            a.interview &&
            a.interview.meetingTime &&
            b.interview &&
            b.interview.meetingTime
          ) {
            return (
              new Date(a.interview.meetingTime).getTime() -
              new Date(b.interview.meetingTime).getTime()
            );
          }
          return -1;
        })
        .filter((item: RegistrationItemResponse) => {
          if (
            selectedDate &&
            selectedDate != "" &&
            item.interview &&
            item.interview.meetingTime
          ) {
            return (
              formatDate.DD_MM_YYYY(item.interview.meetingTime) ==
              formatDate.DD_MM_YYYY(selectedDate)
            );
          }
          return true;
        });

      finalData =
        (deleteModeOn === true || deleteMode) && deleteModeOn != "false"
          ? [...finalData].filter(
              (item) =>
                Number(formatDate.YYYY(item.createdAt)) <
                Number(
                  formatDate.YYYY(formatDate.getISODateInVietnamTimeZone())
                )
            )
          : [...finalData];

      setRowCount(finalData.length);
      setRows(finalData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchApprovedRegistrations();
  };

  useEffect(() => {
    handleRefresh();
  }, [openDialog]);

  // Gọi API khi component được render
  useEffect(() => {
    fetchApprovedRegistrations();
    storeCurrentPath(PATH_ADMIN.admin_approved_registration);
  }, [selectedDate, currentFilter]);

  useEffect(() => {
    setSelectedRegistrations([]);
  }, [currentFilter]);

  // Xử lý khi thay đổi các lựa chọn trong bảng
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRegistrations(newSelectionModel);
  };

  const fetchSelectedRegistrationOfModal = async () => {
    await registrationApi
      .getRegistrationById(selectedRegistrations[0].toString())
      .then((res) => {
        setSelectedRegistrationOfModal(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Mở modal phê duyệt phỏng vấn
  const handleOpenApprovalModal = (registrationId: string) => {
    const selectedRow = rows.find((row) => row.id === registrationId);

    if (!selectedRow || !selectedRow.interview) {
      sweetAlert.alertFailed(
        "Không tìm thấy thông tin phỏng vấn!",
        "",
        1000,
        22
      );
      return;
    }

    const meetingTime = new Date(selectedRow.interview.meetingTime);
    const currentTime = new Date();

    if (currentTime < meetingTime) {
      sweetAlert.alertWarning(
        `Chưa đến thời điểm phỏng vấn. Vui lòng quay lại sau ${formatDate.DD_MM_YYYY_Time(
          selectedRow.interview.meetingTime
        )}`,
        "",
        10000,
        30
      );
      return;
    }

    if (selectedRow) {
      setSelectedRegistration(selectedRow);
      fetchSelectedRegistrationOfModal();
      setOpenApprovalModal(true);
    }
  };

  const handleCloseApprovalModal = () => {
    setSelectedRegistrationOfModal(null);
    setOpenApprovalModal(false);
    setInterviewNote(""); // Reset các trường input
    setInterviewResult("");
  };

  // Mở modal cập nhật phỏng vấn
  const handleOpenUpdateModal = (registrationId: string) => {
    const selectedRow = rows.find((row) => row.id === registrationId);
    if (selectedRow) {
      setSelectedRegistration(selectedRow);
      fetchSelectedRegistrationOfModal();
      setSelectedRecruiters(
        selectedRow.interview.recruiters.map((recruiter: any) => ({
          value: recruiter.id,
          label: `${recruiter.fullName}`,
        }))
      );
      setMeetingTime(
        selectedRow.interview ? selectedRow.interview.meetingTime : ""
      );
      fetchRecruiters(); // Gọi API lấy danh sách recruiters
      setOpenUpdateModal(true);
    }
  };

  const handleCloseUpdateModal = () => {
    setSelectedRegistrationOfModal(null);
    setOpenUpdateModal(false);
    setSelectedRecruiters([]);
    setMeetingTime("");
  };

  // Mở modal xóa phỏng vấn
  // const handleOpenDeleteModal = () => {
  //   fetchSelectedRegistrationOfModal();
  //   setOpenDeleteModal(true);
  // };

  // const handleCloseDeleteModal = () => {
  //   setSelectedRegistrationOfModal(null);
  //   setOpenDeleteModal(false);
  // };

  // Xác nhận phỏng vấn
  const handleConfirmInterview = async () => {
    enableLoading();
    if (!interviewNote || interviewNote.trim() === "") {
      sweetAlert.alertWarning("Vui lòng nhập nhận xét ứng viên", "", 5000, 26);
      disableLoading();
      return;
    }

    if (!interviewResult) {
      sweetAlert.alertWarning("Vui lòng chọn kết quả phỏng vấn", "", 5000, 26);
      disableLoading();
      return;
    }

    const isPassed = interviewResult === "Chấp nhận";
    const registrationStatus = isPassed
      ? RegistrationStatus.Approved_Phong_Van
      : RegistrationStatus.Rejected_Phong_Van;

    try {
      if (selectedRegistration) {
        const interviewId = selectedRegistration.interview?.id;
        if (interviewId) {
          await interviewApi.updateInterview(interviewId, {
            meetingTime: null,
            note: interviewNote,
            isPassed,
            emailInterview: true,
          });
        }

        await registrationApi.updateRegistration(selectedRegistration.id, {
          status: registrationStatus,
        });

        let processRes = await interviewProcessApi.createInterviewProcess({
          registrationId: selectedRegistration.id,
          name: RegistrationProcessTitle.PHONG_VAN,
        });

        await interviewProcessApi.updateInterviewProcess(
          processRes.data.data.id,
          {
            name: RegistrationProcessTitle.PHONG_VAN,
            status: isPassed
              ? RegistrationProcessStatus.Approved
              : RegistrationProcessStatus.Rejected,
          }
        );

        handleCloseApprovalModal();
        setSelectedRegistrations([]);
        sweetAlert.alertSuccess("Phê duyệt thành công", "", 2000, 24);
        fetchApprovedRegistrations();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật phỏng vấn:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi phê duyệt", "", 2000, 24);
    } finally {
      disableLoading();
    }
    disableLoading();
  };

  // Xác nhận cập nhật phỏng vấn
  const handleUpdateInterview = async () => {
    if (selectedRecruiters.length <= 0) {
      sweetAlert.alertWarning(
        "Danh sách người phỏng vấn đang trống",
        "Vui lòng chọn ít nhất 1 người phỏng vấn",
        5000,
        29
      );
      return;
    }
    if (!meetingTime || meetingTime == "") {
      sweetAlert.alertWarning(
        "Thời gian phỏng vấn đang trống",
        "Vui lòng chọn thời gian phỏng vấn",
        5000,
        29
      );
      return;
    }
    if (!updatedInterviewReason || updatedInterviewReason.trim() == "") {
      sweetAlert.alertWarning(
        "Lý do cập nhật lịch đang bị trống",
        "Vui lòng nhập lý do để tiếp tục",
        5000,
        29
      );
      return;
    }
    enableLoading();
    try {
      if (selectedRegistration) {
        const interviewId = selectedRegistration.interview?.id;
        if (interviewId) {
          await interviewApi.updateInterview(interviewId, {
            meetingTime,
            note: selectedRegistration.interview.note,
            isPassed: selectedRegistration.interview.isPassed,
            reason: updatedInterviewReason,
            accounts: selectedRecruiters.map((rec: any) => rec.value),
          });
        }

        handleCloseUpdateModal();
        sweetAlert.alertSuccess("Cập nhật thành công", "", 1000, 20);
        setSelectedRegistrations([]);
        fetchApprovedRegistrations();
        setUpdatedInterviewReason("");
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật phỏng vấn:", error);
      if (error && error.message) {
        if (
          error.message.toString().toLowerCase().includes("scheduled at least")
        ) {
          sweetAlert.alertFailed(
            "Lỗi khi xếp lịch phỏng vấn",
            `Lịch phỏng vấn phải cách ngày hiện tại ít nhất ${error.message.split("scheduled at least ")[1].split(" ")[0].trim()} ngày`,
            10000,
            24
          );
        }
      }
    } finally {
      disableLoading();
    }
  };

  // Xử lý hiển thị các nút khi lọc
  const renderFilterButtons = () => {
    return (
      <div>
        <MuiSelect
          labelId="result-label"
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value)}
          className={`
               h-[40px] w-[200px]
              ${currentFilter == "waiting" ? "bg-primary text-white" : ""}
              ${currentFilter == "accepted" ? "bg-success text-white" : ""}
              ${currentFilter == "rejected" ? "bg-danger text-white" : ""}
              `}
        >
          <MenuItem value="waiting" className="bg-primary text-white py-2">
            Đơn chờ phỏng vấn
          </MenuItem>
          <MenuItem value="accepted" className="bg-success text-white py-2">
            Đơn chấp nhận
          </MenuItem>
          <MenuItem value="rejected" className="bg-danger text-white py-2">
            Đơn từ chối
          </MenuItem>
        </MuiSelect>
      </div>
    );
  };

  const fetchAccounts = async () => {
    try {
      setAccounts([]);
      const firstRes = await accountApi.getAllAccounts(1, 10000);

      const { data } = await accountApi.getAllAccounts(
        1,
        firstRes.data.data.total
      );

      const firstCateRes = await catechistApi.getAllCatechists();
      const cateRes = await catechistApi.getAllCatechists(
        1,
        firstCateRes.data.data.total
      );
      data.data.items
        .filter(
          (item: any) =>
            !item.isDeleted && item.role.roleName == RoleNameEnum.Catechist
        )
        .forEach((item) => {
          const action = async () => {
            const cate = cateRes.data.data.items.find(
              (cate) => cate.account.id == item.id
            );
            if (cate) {
              setAccounts((prev) => [...prev, { ...item, cate: cate }]);
            }
          };
          action();
        });
    } catch (error) {
      console.error("Lỗi khi tải danh sách accounts:", error);
    }
  };

  const handleOpenModal = () => {
    fetchAccounts(); // Load accounts before opening modal
    fetchSelectedRegistrationOfModal();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMeetingTime("");
  };

  const handleScheduleInterview = async () => {
    try {
      enableLoading();
      const registrationId: string = selectedRegistrations[0].toString();
      const selectedAccountIds = selectedAccounts.map((acc: any) => acc.value);

      if (meetingTime == "") {
        sweetAlert.alertFailed(
          "Vui lòng chọn thời gian phỏng vấn",
          "",
          6000,
          27
        );
        return;
      }

      if (interviewTypeOption < 0) {
        sweetAlert.alertFailed(
          "Vui lòng chọn hình thức phỏng vấn",
          "",
          6000,
          27
        );
        return;
      }

      if (selectedAccountIds.length <= 0) {
        sweetAlert.alertFailed("Vui lòng chọn người phỏng vấn", "", 6000, 26);
        return;
      }

      await interviewApi.createInterview({
        registrationId,
        meetingTime: meetingTime,
        interviewType: interviewTypeOption,
        accounts: selectedAccountIds,
      });

      await registrationApi.updateRegistration(registrationId, {
        status: RegistrationStatus.Approved_Duyet_Don,
      });

      let process = await interviewProcessApi.createInterviewProcess({
        registrationId: registrationId,
        name: `${RegistrationProcessTitle.PHONG_VAN_LAI}`,
      });

      await interviewProcessApi.updateInterviewProcess(process.data.data.id, {
        name: `${RegistrationProcessTitle.PHONG_VAN_LAI}`,
        status: RegistrationProcessStatus.Approved,
      });

      sweetAlert.alertSuccess(
        "Đã xếp lịch phỏng vấn thành công!",
        "",
        1000,
        28
      );
      handleCloseModal();
      fetchApprovedRegistrations(); // Refresh registration data after scheduling
      setSelectedRegistrations([]);
      setMeetingTime("");
      setInterviewTypeOption(-1);
    } catch (error: any) {
      console.error("Lỗi khi xếp lịch phỏng vấn:", error);
      if (error && error.message) {
        if (
          error.message.toString().toLowerCase().includes("scheduled at least")
        ) {
          sweetAlert.alertFailed(
            "Lỗi khi xếp lịch phỏng vấn",
            `Lịch phỏng vấn phải cách ngày hiện tại ít nhất ${error.message.split("scheduled at least ")[1].split(" ")[0].trim()} ngày`,
            10000,
            24
          );
        }
      }
    } finally {
      disableLoading();
    }
  };

  useEffect(() => {
    if (meetingTime == "") {
      setSelectedAccounts([]);
      setPreviewAccounts([]);
      setInterviewTypeOption(-1);
    } else if (meetingTime && meetingTime != "") {
      const action = async () => {
        const res = await accountApi.getRecruitersByMeetingTime(meetingTime);
        setPreviewAccounts(
          res.data.data.items.sort((a: any, b: any) => {
            if (a.interviews && b.interviews) {
              return a.interviews.length - b.interviews.length;
            }
            return -1;
          })
        );
      };
      action();
    }
  }, [meetingTime]);

  // Vô hiệu hóa các hành động khi không ở trạng thái "waiting"
  const disableActions = currentFilter !== "waiting";
  const disableActionsApproved = currentFilter !== "accepted";

  const handleDeleteRegistrations = async () => {
    const confirm = await sweetAlert.confirm(
      `Bạn có chắc muốn xóa ${selectedRegistrations.length} đơn`,
      "",
      "Xác nhận",
      "Hủy bỏ",
      "question"
    );
    if (!confirm) {
      return;
    }
    try {
      enableLoading();
      const deletePromises = selectedRegistrations.map(async (id) => {
        await registrationApi.deleteRegistration(id.toString());
      });

      await Promise.all(deletePromises);
      sweetAlert.alertSuccess("Xóa đơn ứng tuyển thành công!", "", 1000, 28);

      fetchApprovedRegistrations(true);
      setSelectedRegistrations([]);
    } catch (error: any) {
      console.error("Lỗi khi xóa đơn ứng tuyển:", error);
      sweetAlert.alertFailed("Lỗi khi xóa đơn ứng tuyển", ``, 10000, 24);
    } finally {
      disableLoading();
    }
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1
        className={`text-center text-[2rem] py-2 font-bold bg_title text-text_primary_light
        ${deleteMode ? "bg-black text-text_primary_light" : ""}`}
      >
        {!deleteMode && currentFilter == "waiting"
          ? "Danh sách ứng viên chờ phỏng vấn"
          : ""}
        {!deleteMode && currentFilter == "accepted"
          ? "Danh sách ứng viên đậu phỏng vấn"
          : ""}
        {!deleteMode && currentFilter == "rejected"
          ? "Danh sách ứng viên bị từ chối"
          : ""}
        {deleteMode ? "Lọc các đơn cũ" : ""}
      </h1>

      <div className="flex justify-between items-center w-full my-3">
        {/* Chọn ngày filter */}
        <div className="flex justify-start px-3 min-w-[10px]">
          {!deleteMode ? (
            <>
              {renderFilterButtons()}
              <input
                type="date"
                className="w-[200px] py-2 px-2 ml-2 border-1 border-black border rounded-md bg-white"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="flex px-3 gap-x-2">
          {selectedRegistrations.length > 0 && !disableActions && (
            <>
              {selectedRegistrations.length === 1 ? (
                <>
                  <Button
                    color="success"
                    variant="outlined"
                    className="btn btn-success"
                    onClick={() =>
                      handleOpenApprovalModal(
                        selectedRegistrations[0].toString()
                      )
                    }
                  >
                    Phê duyệt phỏng vấn
                  </Button>
                  <Button
                    color="warning"
                    variant="outlined"
                    className="btn btn-warning"
                    onClick={() =>
                      handleOpenUpdateModal(selectedRegistrations[0].toString())
                    }
                  >
                    Cập nhật lịch phỏng vấn
                  </Button>
                </>
              ) : (
                <></>
              )}
            </>
          )}
          {selectedRegistrations.length > 0 && !disableActionsApproved && (
            <div className="flex justify-end">
              {selectedRegistrations.length === 1 &&
              rows.findIndex(
                (item) => item.id == selectedRegistrations[0].toString()
              ) >= 0 &&
              !rows
                .find(
                  (item: RegistrationItemResponse) =>
                    item.id == selectedRegistrations[0].toString()
                )
                ?.registrationProcesses.find(
                  (item) => item.name == RegistrationProcessTitle.TAO_TAI_KHOAN
                ) ? (
                <>
                  <Button
                    className="btn btn-success"
                    color="success"
                    variant="outlined"
                    onClick={() => setOpenDialog(true)}
                  >
                    Tạo tài khoản
                  </Button>
                </>
              ) : (
                <></>
              )}
              {/* <button
                onClick={handleOpenDeleteModal}
                className="btn btn-danger ml-1"
              >
                Xóa lịch phỏng vấn
              </button> */}
            </div>
          )}
          {selectedRegistrations.length == 1 ? (
            <>
              <Button
                className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
                onClick={() => setOpenDialogRegisDetail(true)}
                variant="outlined"
                color="secondary"
              >
                Xem chi tiết
              </Button>
            </>
          ) : (
            <></>
          )}

          {currentFilter == "rejected" &&
          deleteMode &&
          selectedRegistrations.length > 0 ? (
            <>
              <Button
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteRegistrations();
                }}
                variant="outlined"
                color="error"
              >
                Xóa đơn
              </Button>
            </>
          ) : (
            <></>
          )}
          {currentFilter === "rejected" && !deleteMode ? (
            <>
              <Button
                onClick={() => {
                  setDeleteMode(true);
                  fetchApprovedRegistrations(true);
                  setSelectedRegistrations([]);
                }}
                variant="outlined"
                color="secondary"
              >
                Lọc đơn
              </Button>
            </>
          ) : (
            <></>
          )}
          {currentFilter === "rejected" && deleteMode ? (
            <>
              <Button
                onClick={() => {
                  setDeleteMode(false);
                  fetchApprovedRegistrations("false");
                }}
                variant="outlined"
                color="primary"
              >
                Xong
              </Button>
            </>
          ) : (
            <></>
          )}

          {currentFilter === "rejected" &&
          selectedRegistrations.length === 1 &&
          !deleteMode &&
          false ? (
            <>
              <Button
                className="btn btn-primary"
                onClick={() => {
                  handleOpenModal();
                }}
                variant="outlined"
                color="primary"
              >
                Xếp lịch phỏng vấn lại
              </Button>
            </>
          ) : (
            <></>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleRefresh();
            }}
          >
            Tải lại
          </Button>
        </div>
      </div>

      <div className="px-2">
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="client"
          rowCount={rowCount} // Đảm bảo rowCount là tổng số hàng từ server
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel} // Cập nhật paginationModel khi thay đổi
          pageSizeOptions={[10, 25, 50, 100, 250]}
          onRowSelectionModelChange={handleSelectionChange}
          rowSelectionModel={selectedRegistrations}
          checkboxSelection
          sx={{
            height: 480,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
          localeText={viVNGridTranslation}
          disableMultipleRowSelection={!deleteMode}
        />
      </div>

      {/* Modal phê duyệt phỏng vấn */}
      <Modal open={openApprovalModal} onClose={handleCloseApprovalModal}>
        <div
          style={{
            width: "50%",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
          className="py-5 px-5 mt-4"
        >
          <h1 className="text-center text-[2.2rem] text-primary py-2 pt-0 font-bold uppercase">
            Phê duyệt phỏng vấn
          </h1>

          {selectedRegistrationOfModal ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-2 w-[50%]">
                  <strong>Tên ứng viên:</strong>{" "}
                  {selectedRegistrationOfModal.fullName}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Thời gian phỏng vấn:</strong>{" "}
                  {formatDate.DD_MM_YYYY_Time(
                    selectedRegistrationOfModal.interview.meetingTime
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Giới tính:</strong>{" "}
                  {selectedRegistrationOfModal.gender}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(
                    selectedRegistrationOfModal.dateOfBirth
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedRegistrationOfModal.phone}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Email:</strong> {selectedRegistrationOfModal.email}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistrationOfModal.isTeachingBefore
                    ? "Có"
                    : "Không"}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistrationOfModal.yearOfTeaching}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedRegistrationOfModal.address}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Người phỏng vấn:</strong>{" "}
                  {selectedRegistrationOfModal.interview.recruiters
                    ? selectedRegistrationOfModal.interview.recruiters
                        .map((recruiter: any) => recruiter.fullName)
                        .join(", ")
                    : ""}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          <h2 className="my-0 py-0 mt-3">
            <strong>Nhận xét ứng viên</strong>
          </h2>

          <div className="w-full">
            <CkEditor
              data={interviewNote}
              onChange={(data) => setInterviewNote(data)}
              placeholder="Nhập nhận xét ứng viên tại đây..."
            />
          </div>

          {/* <TextField
            label="Ghi chú"
            fullWidth
            multiline
            rows={3}
            value={interviewNote}
            onChange={(e) => setInterviewNote(e.target.value)}
            placeholder="Nhập ghi chú phỏng vấn (không bắt buộc)"
            margin="normal"
            className="my-0 mt-1"
          /> */}

          <FormControl fullWidth margin="normal" className="my-0 mt-3">
            <label id="result-label">
              <strong>Kết quả phỏng vấn</strong>
            </label>
            <MuiSelect
              labelId="result-label"
              value={interviewResult}
              onChange={(e) => setInterviewResult(e.target.value)}
              className={`${interviewResult == "Chấp nhận" ? "bg-success text-white" : ""}
              ${interviewResult == "Từ chối" ? "bg-danger text-white" : ""}`}
            >
              <MenuItem
                value="Chấp nhận"
                className="bg-success text-white py-3"
              >
                Chấp nhận
              </MenuItem>
              <MenuItem value="Từ chối" className="bg-danger text-white py-3">
                Từ chối
              </MenuItem>
            </MuiSelect>
          </FormControl>

          <div
            className="modal-buttons"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button onClick={handleCloseApprovalModal} variant="outlined">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmInterview}
              variant="contained"
              color="primary"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal cập nhật phỏng vấn */}
      <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
        <div
          style={{
            width: "50%",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
          className="py-5 px-5 mt-4"
        >
          <h1 className="text-center text-[2.2rem] text-warning py-2 pt-0 font-bold uppercase">
            Cập nhật lịch phỏng vấn
          </h1>

          {selectedRegistrationOfModal ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-2 w-[50%]">
                  <strong>Tên ứng viên:</strong>{" "}
                  {selectedRegistrationOfModal.fullName}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Thời gian phỏng vấn:</strong>{" "}
                  {formatDate.DD_MM_YYYY_Time(
                    selectedRegistrationOfModal.interview.meetingTime
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Giới tính:</strong>{" "}
                  {selectedRegistrationOfModal.gender}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(
                    selectedRegistrationOfModal.dateOfBirth
                  )}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số điện thoại:</strong>{" "}
                  {selectedRegistrationOfModal.phone}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Email:</strong> {selectedRegistrationOfModal.email}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistrationOfModal.isTeachingBefore
                    ? "Có"
                    : "Không"}
                </h5>
                <h5 className="mt-2 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistrationOfModal.yearOfTeaching}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedRegistrationOfModal.address}
                </h5>
                <h5 className="mt-2 w-[100%]">
                  <strong>Người phỏng vấn:</strong>{" "}
                  {selectedRegistrationOfModal.interview.recruiters
                    ? selectedRegistrationOfModal.interview.recruiters
                        .map((recruiter: any) => recruiter.fullName)
                        .join(", ")
                    : ""}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          {/* Cập nhật người phỏng vấn */}
          <FormControl fullWidth margin="normal">
            <label className="font-bold mt-1">Cập nhật người phỏng vấn</label>
            <Select
              options={recruiters.map((acc: any) => ({
                value: acc.id,
                label: `${acc.fullName} ${acc.cate ? ` - ${acc.cate.code}` : ""}`,
              }))}
              isMulti
              value={selectedRecruiters}
              onChange={(newValue: any) =>
                setSelectedRecruiters(
                  newValue as { value: string; label: string }[]
                )
              }
              placeholder="Tìm kiếm và chọn người phỏng vấn..."
              className="mt-1 z-[999]"
            />
          </FormControl>

          {/* Cập nhật thời gian phỏng vấn */}
          <TextField
            label="Cập nhật thời gian phỏng vấn"
            type="datetime-local"
            fullWidth
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <div className="mt-2">
            <h5 className="w-[100%] mb-1">
              <strong>Lý do cập nhật phỏng vấn</strong>
            </h5>
            <textarea
              name="updatedInterviewReason"
              onChange={(e) => {
                setUpdatedInterviewReason(e.target.value);
              }}
              className="block w-full p-2 border border-gray-700 rounded-lg"
            />
          </div>

          <div
            className="modal-buttons"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button
              onClick={handleCloseUpdateModal}
              variant="outlined"
              color="warning"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleUpdateInterview}
              variant="contained"
              color="warning"
            >
              Cập nhật
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal xóa phỏng vấn */}
      <Dialog
        open={isModalOpen}
        className="z-[1000] flex justify-center items-center"
        fullWidth
        maxWidth="xl"
      >
        <div
          className="modal-container bg-white py-5 px-5 rounded-lg
        w-full"
          style={{ scrollBehavior: "smooth", overflowY: "scroll" }}
        >
          <h1 className="text-center text-[2.2rem] text-primary py-2 pt-0 font-bold uppercase">
            Xếp lịch phỏng vấn lại
          </h1>

          {selectedRegistration ? (
            <>
              <div className="flex flex-wrap mt-3">
                <h5 className="mt-3 w-[100%]">
                  <strong>Tên ứng viên:</strong> {selectedRegistration.fullName}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Giới tính:</strong> {selectedRegistration.gender}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Ngày sinh:</strong>{" "}
                  {formatDate.DD_MM_YYYY(selectedRegistration.dateOfBirth)}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Số điện thoại:</strong> {selectedRegistration.phone}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Email:</strong> {selectedRegistration.email}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Kinh nghiệm:</strong>{" "}
                  {selectedRegistration.isTeachingBefore ? "Có" : "Không"}
                </h5>
                <h5 className="mt-3 w-[50%]">
                  <strong>Số năm giảng dạy:</strong>{" "}
                  {selectedRegistration.yearOfTeaching}
                </h5>
                <h5 className="mt-3 w-[100%]">
                  <strong>Địa chỉ:</strong> {selectedRegistration.address}
                </h5>
              </div>
            </>
          ) : (
            <></>
          )}

          <label className="font-bold mt-4">Ngày phỏng vấn</label>
          <br />
          <input
            type="datetime-local"
            className="w-full rounded mt-1 py-2 px-2"
            style={{ border: "1px solid #d9d9d9" }}
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />

          {meetingTime != "" ? (
            <>
              <label className="font-bold mt-4">Chọn hình thức phỏng vấn</label>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                value={interviewTypeOption}
                onChange={(event) => {
                  setInterviewTypeOption(Number(event.target.value));
                }}
              >
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Trực tiếp"
                />
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Online"
                />
              </RadioGroup>
              <label className="font-bold mt-4">Chọn người phỏng vấn</label>
              <Select
                options={accounts.map((acc: any) => ({
                  value: acc.id,
                  label: `${acc.fullName}`,
                }))}
                isMulti
                onChange={(newValue) =>
                  setSelectedAccounts(
                    newValue as { value: string; label: string }[]
                  )
                }
                placeholder="Tìm kiếm và chọn người phỏng vấn..."
                className="mt-1"
              />
              <label className="font-bold mt-4">
                Danh sách lịch phân công phỏng vấn ngày{" "}
                {formatDate.DD_MM_YYYY(meetingTime)}
              </label>
              <DataGrid
                rows={previewAccounts}
                columns={[
                  {
                    field: "avatar",
                    headerName: "Ảnh",
                    width: 100,
                    renderCell: (params) => (
                      <img
                        src={
                          params.row.avatar || "https://via.placeholder.com/50"
                        }
                        alt="Avatar"
                        width={50}
                        height={50}
                        style={{ borderRadius: "3px" }}
                      />
                    ),
                  },
                  { field: "fullName", headerName: "Họ và Tên", width: 200 },
                  { field: "gender", headerName: "Giới tính", width: 150 },
                  {
                    field: "interviewCount",
                    headerName: "Số lượng phỏng vấn",
                    width: 150,
                    renderCell: (params) => (
                      <>
                        {params.row.interviews ? (
                          <>
                            {params.row.interviews.length}
                            {params.row.interviews.length > 0 ? (
                              <>{` (${params.row.interviews
                                .map((item: any) =>
                                  formatDate.HH_mm(item.meetingTime)
                                )
                                .join(", ")})`}</>
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <>0</>
                        )}
                      </>
                    ),
                  },
                ]}
                paginationMode="client"
                rowCount={previewAccounts.length}
                loading={loading}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[8, 25, 50]}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                }}
                localeText={viVNGridTranslation}
              />
            </>
          ) : (
            <></>
          )}

          <div className="modal-buttons flex justify-center gap-x-3 mt-4">
            <Button
              onClick={() => {
                handleScheduleInterview();
              }}
              variant="contained"
            >
              Xác nhận
            </Button>
            <Button
              onClick={() => {
                handleCloseModal();
              }}
              variant="outlined"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </Dialog>

      {openDialog ? (
        <>
          <CreateAccountAndCatechistDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            registrationItem={rows.find(
              (row) =>
                row.id ===
                (selectedRegistrations[0]
                  ? selectedRegistrations[0].toString()
                  : "")
            )} // Đưa item được chọn
            refresh={fetchApprovedRegistrations}
          />
        </>
      ) : (
        <></>
      )}
      {openDialogRegisDetail ? (
        <>
          <RegistrationDetailDialog
            open={openDialogRegisDetail}
            onClose={() => setOpenDialogRegisDetail(false)}
            id={selectedRegistrations[0].toString()}
          />
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
}
