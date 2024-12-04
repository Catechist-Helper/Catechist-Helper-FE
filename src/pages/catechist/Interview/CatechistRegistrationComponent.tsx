import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import viVNGridTranslation from "../../../locale/MUITable";
import RegistrationDetailDialog from "./RegistrationDetailDialog";
import dayjs from "dayjs";
import registrationApi from "../../../api/Registration";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import { formatDate } from "../../../utils/formatDate";
import { getUserInfo } from "../../../utils/utils";

// import { RegistrationProcessTitle } from "../../../enums/RegistrationProcess";

// Cấu hình các cột trong DataGrid
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
    field: "note",
    headerName: "Ghi chú",
    width: 200,
  },
  // {
  //   field: "interviews",
  //   headerName: "Kết quả phỏng vấn",
  //   width: 200,
  //   renderCell: (params) => {
  //     return params.row.interviews[0]?.note || ""; // Hiển thị ghi chú nếu có
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
  },
];

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
  const [currentFilter, setCurrentFilter] = useState<
    "waiting" | "accepted" | "rejected"
  >("waiting");
  const [openDialogRegisDetail, setOpenDialogRegisDetail] =
    useState<boolean>(false);

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

      // Xác định ngày bắt đầu và kết thúc (lọc theo ngày nếu có selectedDate)
      const startDate = selectedDate ? selectedDate : undefined;
      const endDate = selectedDate ? selectedDate : undefined;

      // Gọi API getAllRegistrations với các tham số
      const firstResponse = await registrationApi.getAllRegistrations(
        startDate,
        endDate,
        status,
        1, // Sử dụng paginationModel.page + 1 vì API có thể sử dụng số trang bắt đầu từ 1
        2 // Sử dụng kích thước trang từ paginationModel
      );

      const { data } = await registrationApi.getAllRegistrations(
        startDate,
        endDate,
        status,
        1, // Sử dụng paginationModel.page + 1 vì API có thể sử dụng số trang bắt đầu từ 1
        firstResponse.data.data.total // Sử dụng kích thước trang từ paginationModel
      );
      let finalData = data.data.items.filter(
        (item: RegistrationItemResponse) => {
          return (
            item.interview &&
            item.interview.recruiters &&
            item.interview.recruiters &&
            item.interview.recruiters.find((item) => {
              return item.id == userLogin.id;
            })
          );
        }
      );

      // Cập nhật tổng số hàng
      setRowCount(finalData.length); // Cập nhật tổng số hàng từ API
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
      ); // Cập nhật hàng được trả về từ API
    } catch (error) {
      console.error("Lỗi khi tải danh sách registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedRegistrations();
  }, [userLogin]);

  const handleRefresh = () => {
    fetchApprovedRegistrations();
  };

  const element = document.querySelector<HTMLElement>(
    ".MuiTablePagination-selectLabel"
  );
  if (element) {
    element.innerHTML = "Số hàng mỗi trang";
  }

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
        {currentFilter !== "waiting" && (
          <button
            className="btn btn-info ml-1"
            onClick={() => setCurrentFilter("waiting")}
          >
            Đơn chờ phỏng vấn
          </button>
        )}
        {currentFilter !== "accepted" && (
          <button
            className="btn btn-success ml-1"
            onClick={() => setCurrentFilter("accepted")}
          >
            Đơn chấp nhận
          </button>
        )}
        {currentFilter !== "rejected" && (
          <button
            className="btn btn-danger ml-1"
            onClick={() => setCurrentFilter("rejected")}
          >
            Đơn từ chối
          </button>
        )}
      </div>
    );
  };

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
      }}
    >
      <h1
        className={`text-center text-[2rem] py-2 font-bold 
        ${currentFilter == "waiting" ? "bg-info text-text_primary_dark" : ""} 
        ${currentFilter == "accepted" ? "bg-success text-text_primary_light" : ""} 
        ${currentFilter == "rejected" ? "bg-danger text-text_primary_light" : ""}`}
      >
        {currentFilter == "waiting" ? "Danh sách phỏng vấn ứng viên" : ""}
        {currentFilter == "accepted" ? "Danh sách ứng viên đậu phỏng vấn" : ""}
        {currentFilter == "rejected" ? "Danh sách ứng viên bị từ chối" : ""}
      </h1>

      <div className="flex justify-between items-center w-full my-3">
        {/* Chọn ngày filter */}
        <div className="flex justify-start px-3">
          <input
            type="date"
            className="w-[200px] py-2 px-2 border rounded-md"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {renderFilterButtons()}
        </div>
        <div className="flex">
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
                border: 0,
              }}
              localeText={viVNGridTranslation}
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
    </Paper>
  );
}
