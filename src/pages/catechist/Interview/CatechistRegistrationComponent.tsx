import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import viVNGridTranslation from "../../../locale/MUITable";
import RegistrationDetailDialog from "../../admin/ApprovedRegistration/RegistrationDetailDialog";
import dayjs from "dayjs";
import registrationApi from "../../../api/Registration";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import { formatDate } from "../../../utils/formatDate";
import { getUserInfo } from "../../../utils/utils";
import sweetAlert from "../../../utils/sweetAlert";
import { Button, MenuItem, Modal, Select } from "@mui/material";
import CkEditorComponent from "../../../components/ckeditor5/CkEditor";
import useAppContext from "../../../hooks/useAppContext";
import interviewApi from "../../../api/Interview";

// Hàm chính để hiển thị danh sách đơn
export default function CatechistRegistrationsTable() {
  const [rows, setRows] = useState<RegistrationItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedRegistrations, setSelectedRegistrations] =
    useState<GridRowSelectionModel>([]);
  const [userLogin, setUserLogin] = useState<any>(null);

  // State cho loại đơn hiện tại
  const [currentFilter, setCurrentFilter] = useState<string>("waiting");
  const [openDialogRegisDetail, setOpenDialogRegisDetail] =
    useState<boolean>(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationItemResponse | null>(null);
  const [selectedRegistrationOfModal, setSelectedRegistrationOfModal] =
    useState<RegistrationItemResponse | null>(null);
  const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
  const [interviewNote, setInterviewNote] = useState<string>("");
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userLoggedin = getUserInfo(); // Hàm lấy thông tin người dùng đăng nhập
        setUserLogin(userLoggedin);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch các đơn đã duyệt dựa trên trạng thái và lọc theo ngày
  const fetchApprovedRegistrations = async () => {
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
        status,
        1, // Sử dụng paginationModel.page + 1 vì API có thể sử dụng số trang bắt đầu từ 1
        2 // Sử dụng kích thước trang từ paginationModel
      );

      const { data } = await registrationApi.getAllRegistrations(
        undefined,
        undefined,
        status,
        1, // Sử dụng paginationModel.page + 1 vì API có thể sử dụng số trang bắt đầu từ 1
        firstResponse.data.data.total // Sử dụng kích thước trang từ paginationModel
      );
      let finalData = data.data.items
        .filter((item: RegistrationItemResponse) => {
          return (
            item.interview &&
            item.interview.recruiters &&
            item.interview.recruiters &&
            item.interview.recruiters.find((item) => {
              if (userLogin && userLogin.id) {
                return item.id == userLogin.id;
              }
              return true;
            })
          );
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

      if (userLogin && userLogin.id) {
        setRowCount(finalData.length);
        setRows(
          finalData.sort(
            (a: RegistrationItemResponse, b: RegistrationItemResponse) => {
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
            }
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách registrations:", error);
    } finally {
      setLoading(false);
    }
  };

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
      width: 120,
      renderCell: (params) => {
        return params.row.interview &&
          params.row.interview.interviewType == 1 ? (
          <>
            <a
              className="text-[1rem] border-2 border-green-700  text-green-700  rounded-xl px-2
            hover:bg-green-700 hover:border-0 hover:text-white"
              style={{ cursor: "pointer" }}
              target="_blank"
              href={
                params.row.interview.recruiterInInterviews &&
                params.row.interview.recruiterInInterviews.find(
                  (item: any) => item.accountId == userLogin.id
                )
                  ? params.row.interview.recruiterInInterviews.find(
                      (item: any) => item.accountId == userLogin.id
                    ).onlineRoomUrl
                  : ""
              }
            >
              Online
            </a>
          </>
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
      field: "recruiters",
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
      field: "evaluation",
      headerName: "Nhận xét ứng viên",
      width: 200,
      renderCell: (params) => {
        const regis: RegistrationItemResponse = params.row;
        if (!(regis.interview && regis.interview.recruiterInInterviews)) {
          return "";
        }
        const regisRecruiter = regis.interview.recruiterInInterviews.find(
          (item) => item.accountId == userLogin.id
        );
        if (regisRecruiter) {
          return (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  regis.interview.recruiterInInterviews.find(
                    (item) => item.accountId == userLogin.id
                  )?.evaluation ?? "",
              }}
            />
          );
        }
        return "";
      },
    },
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
    },
  ];

  useEffect(() => {
    fetchApprovedRegistrations();
  }, [userLogin]);

  const handleRefresh = () => {
    fetchApprovedRegistrations();
  };

  // Gọi API khi component được render
  useEffect(() => {
    fetchApprovedRegistrations();
  }, [selectedDate, currentFilter]);

  useEffect(() => {
    setSelectedRegistrations([]);
  }, [currentFilter]);

  // Xử lý khi thay đổi các lựa chọn trong bảng
  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRegistrations(newSelectionModel);
  };

  // Xử lý hiển thị các nút khi lọc
  const renderFilterButtons = () => {
    return (
      <div>
        <Select
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
        </Select>
      </div>
    );
  };

  const fetchSelectedRegistrationOfModal = async () => {
    await registrationApi
      .getRegistrationById(selectedRegistrations[0].toString())
      .then((res) => {
        setSelectedRegistrationOfModal(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (openApprovalModal == true && selectedRegistration != null) {
      const note = selectedRegistration.interview.recruiterInInterviews.find(
        (item) => item.accountId == userLogin.id
      )?.evaluation;
      if (note && note != "") {
        setInterviewNote(note);
      }
    }
  }, [openApprovalModal, selectedRegistrationOfModal]);

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
      sweetAlert.alertFailed(
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
    setInterviewNote("");
  };

  const handleConfirmInterview = async () => {
    if (!interviewNote) {
      sweetAlert.alertFailed(
        "Vui lòng nhập nhẫn xét cho ứng viên",
        "",
        1000,
        26
      );
      disableLoading();
      return;
    }

    try {
      enableLoading();
      if (selectedRegistrationOfModal) {
        console.log(selectedRegistrationOfModal.interview.id, {
          recruiterAccountId: userLogin.id,
          evaluation: interviewNote,
        });
        await interviewApi.evaluateInterview(
          selectedRegistrationOfModal.interview.id,
          {
            recruiterAccountId: userLogin.id,
            evaluation: interviewNote,
          }
        );

        handleCloseApprovalModal();
        setSelectedRegistrations([]);
        setSelectedRegistrationOfModal(null);
        setInterviewNote("");
        sweetAlert.alertSuccess("Nhận xét thành công", "", 1000, 20);
        fetchApprovedRegistrations();
      }
    } catch (error) {
      console.error("Lỗi khi nhận xét ứng viên:", error);
      sweetAlert.alertFailed("Có lỗi khi nhận xét ứng viên", "", 1000, 26);
    } finally {
      disableLoading();
    }
    disableLoading();
  };
  console.log(rows);

  useEffect(() => {
    if (!openApprovalModal) {
      setSelectedRegistrationOfModal(null);
      setInterviewNote("");
    }
  }, [openApprovalModal]);

  if (!userLogin) {
    return <></>;
  }

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1
        className={`text-center text-[2rem] py-2 font-bold bg_title text-text_primary_light`}
      >
        {currentFilter == "waiting" ? "Danh sách ứng viên chờ phỏng vấn" : ""}
        {currentFilter == "accepted" ? "Danh sách ứng viên đậu phỏng vấn" : ""}
        {currentFilter == "rejected" ? "Danh sách ứng viên bị từ chối" : ""}
      </h1>

      <div className="flex justify-between items-center w-full my-3">
        {/* Chọn ngày filter */}
        <div className="flex justify-start px-3">
          {renderFilterButtons()}
          <input
            type="date"
            className="w-[200px] py-2 px-2 border rounded-md bg-white ml-2 border-black border-1"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex">
          {selectedRegistrations.length == 1 && currentFilter == "waiting" ? (
            <>
              <button
                className="btn btn-info ml-1"
                onClick={() =>
                  handleOpenApprovalModal(selectedRegistrations[0].toString())
                }
              >
                Nhận xét ứng viên
              </button>
            </>
          ) : (
            <></>
          )}
          {selectedRegistrations.length == 1 ? (
            <>
              <button
                className="btn btn-info ml-1"
                onClick={() => setOpenDialogRegisDetail(true)}
              >
                Xem chi tiết
              </button>
            </>
          ) : (
            <></>
          )}

          <button
            className="btn btn-primary ml-1 mr-2"
            onClick={() => {
              handleRefresh();
            }}
          >
            Tải lại
          </button>
        </div>
      </div>

      <div className="px-2">
        {rows.length <= 0 ? (
          <>
            <h1 className="text-[1.2rem] mb-2">
              <strong>Không có ứng viên nào</strong>
            </h1>
          </>
        ) : (
          <>
            <DataGrid
              rows={rows}
              columns={columns}
              paginationMode="client"
              rowCount={rowCount} // Đảm bảo rowCount là tổng số hàng từ server
              loading={loading}
              initialState={{ pagination: { paginationModel } }}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel} // Cập nhật paginationModel khi thay đổi
              pageSizeOptions={[8, 25, 50]}
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
              disableMultipleRowSelection
            />
          </>
        )}
      </div>

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
            Nhận xét ứng viên
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
            <CkEditorComponent
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
    </Paper>
  );
}
