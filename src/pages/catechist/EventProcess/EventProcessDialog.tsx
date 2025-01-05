import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  InputAdornment,
} from "@mui/material";
import Select from "react-select";
import processApi from "../../../api/EventProcess";
import {
  CreateProcessRequest,
  UpdateProcessRequest,
} from "../../../model/Request/EventProcess"; // Import đúng model request
import {
  EventProcessStringStatus,
  EventProcessStatus,
} from "../../../enums/Event";
import sweetAlert from "../../../utils/sweetAlert";
import MemberOfProcessDialog, {
  MemberOfProcessDialogHandle,
} from "./MemberOfProcessDialog";
import { formatCurrencyVND } from "../../../utils/formatPrice";
import { EventItemResponse } from "../../../model/Response/Event";
import { formatDate } from "../../../utils/formatDate";
import CkEditorComponent from "../../../components/ckeditor5/CkEditor";

interface EventProcessDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  processData?: any; // Thêm kiểu dữ liệu nếu cần
  viewModeDialog?: boolean;
  event?: EventItemResponse;
}

const EventProcessDialog: React.FC<EventProcessDialogProps> = ({
  open,
  onClose,
  eventId,
  processData,
  viewModeDialog,
  event,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [fee, setFee] = useState<number>(0);
  const [actualFee, setActualFee] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [status, setStatus] = useState<number>(0);
  const [viewMode, setViewMode] = useState<boolean>(false);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    images: [] as File[],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Thay vì ghi đè, thêm ảnh mới vào mảng hiện tại
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...files], // Thêm các file mới vào mảng ảnh
      }));

      // Cập nhật hình ảnh preview
      const imagePreviewsArray = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [
        ...prevPreviews,
        ...imagePreviewsArray,
      ]); // Thêm các ảnh mới vào preview
    }
  };

  const removeImage = (index: number) => {
    setFormData((prevData) => {
      const newImages = prevData.images.filter((_, i) => i !== index); // Lọc bỏ ảnh tại index
      return { ...prevData, images: newImages };
    });

    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    ); // Cập nhật lại previews
  };

  const childRef = useRef<MemberOfProcessDialogHandle>(null);

  const resetFields = () => {
    setName("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setFee(0);
    setActualFee(0);
    setNote("");
    setStatus(0);
    setViewMode(false);
  };

  useEffect(() => {
    resetFields();
    if (processData) {
      setName(processData.name);
      setDescription(processData.description);
      setStartTime(processData.startTime);
      setEndTime(processData.endTime);
      setFee(processData.fee);
      setActualFee(processData.actualFee);
      setNote(processData.note);
      setStatus(processData.status);
      setViewMode(viewModeDialog ? true : false);
    }
  }, [processData]);

  useEffect(() => {
    if (startTime && endTime && startTime != "" && endTime != "") {
      // Chuyển đổi startDate và endDate sang đối tượng Date
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      // Tính sự chênh lệch giữa hai thời gian (millisecond)
      const diffInMilliseconds = end - start;

      if (diffInMilliseconds <= 0) {
        sweetAlert.alertWarning(
          "Thời gian kết thúc phải sau hơn thời gian bắt đầu",
          "",
          5000,
          35
        );
      }
    }
  }, [startTime, endTime]);

  // Hàm để validate form trước khi submit
  const handleSubmit = async () => {
    if (!name || name.trim() == "") {
      sweetAlert.alertWarning("Tên hoạt động là bắt buộc", "", 3000, 25);
      return;
    }

    if (!description || description.trim() == "") {
      sweetAlert.alertWarning("Mô tả hoạt động là bắt buộc", "", 3000, 25);
      return;
    }

    if (!startTime || startTime.trim() == "") {
      sweetAlert.alertWarning("Thời gian bắt đầu là bắt buộc", "", 3000, 25);
      return;
    }

    if (!endTime || endTime.trim() == "") {
      sweetAlert.alertWarning("Thời gian kết thúc là bắt buộc", "", 3000, 25);
      return;
    }

    if (
      endTime &&
      new Date(endTime).getTime() <= new Date(startTime).getTime() + 3600000
    ) {
      sweetAlert.alertWarning(
        "Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 giờ",
        "",
        3000,
        38
      );
      return;
    }

    if (fee < 0) {
      sweetAlert.alertWarning(
        "Chi phí dự tính không được nhỏ hơn 0",
        "",
        3000,
        30
      );
      return;
    }

    if (actualFee < 0) {
      sweetAlert.alertWarning(
        "Chi phí thực tế không được nhỏ hơn 0",
        "",
        3000,
        30
      );
      return;
    }

    if (!childRef?.current?.checkValidMemberOfProcess()) {
      sweetAlert.alertWarning(
        "Nếu đã gán người đảm nhận thì cần có 1 người đảm nhận chính"
      );
      return;
    }

    // const durationTicks =
    //   durationDays * 24 * 60 * 60 * 10000000 +
    //   durationHours * 60 * 60 * 10000000 +
    //   durationMinutes * 60 * 10000000;

    const data: CreateProcessRequest | UpdateProcessRequest = {
      name,
      description,
      //   duration: { ticks: durationTicks },
      startTime: startTime,
      endTime: endTime ? endTime : startTime,
      fee,
      status,
      eventId,
      actualFee,
      note,
      receiptImages:
        processData &&
        (processData.status == EventProcessStatus.In_Progress ||
          processData.status == EventProcessStatus.Approval) &&
        (status == EventProcessStatus.Completed ||
          status == EventProcessStatus.Cancelled)
          ? formData.images
          : undefined,
    };

    try {
      let createdProcessId = "";
      if (processData) {
        // Update process
        await processApi.updateProcess(processData.id, data);
        sweetAlert.alertSuccess("Cập nhật hoạt động thanh công", "", 3000, 25);

        createdProcessId = processData.id;
      } else {
        // Create new process
        data.actualFee = data.fee;
        data.status = EventProcessStatus.Wait_Approval;
        const createdDataRes = await processApi.createProcess(data);
        sweetAlert.alertSuccess("Tạo hoạt động thanh công", "", 3000, 25);

        createdProcessId = createdDataRes.data.data.id;
      }
      childRef.current?.handleChangeMemberOfProcess(createdProcessId);

      onClose();
    } catch (error) {
      console.error("Error creating/updating process:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra", "", 3000, 20);
    }
  };

  const handleCloseDialog = async () => {
    resetFields();
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="xl" fullWidth>
      <DialogTitle>
        {viewMode
          ? "Xem chi tiết hoạt động"
          : `${processData ? "Cập nhật hoạt động" : "Tạo mới hoạt động"}`}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label={
                <span>
                  Tên hoạt động <span style={{ color: "red" }}>*</span>
                </span>
              }
              className="mt-2"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={
                viewMode ||
                (processData &&
                  processData.status != EventProcessStatus.Wait_Approval)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <p className="text-gray-500 ml-2 mt-1">
              Mô tả hoạt động <span style={{ color: "red" }}>*</span>
            </p>
            {viewMode ||
            (processData &&
              processData.status != EventProcessStatus.Wait_Approval) ? (
              <div className="text-gray-500 ml-2 mt-1">
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </div>
            ) : (
              <>
                <CkEditorComponent
                  data={description}
                  onChange={(data) => setDescription(data)}
                  placeholder="Nhập mô tả hoạt động tại đây..."
                />
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {event && event.startTime ? (
              <p className="text-gray-500 ml-2 mt-1">
                Thời gian bắt đầu sự kiện:{" "}
                {formatDate.DD_MM_YYYY(event?.startTime)}
              </p>
            ) : (
              <></>
            )}
            <TextField
              label={
                <span>
                  Thời gian bắt đầu <span style={{ color: "red" }}>*</span>
                </span>
              }
              type="datetime-local"
              fullWidth
              value={startTime}
              onChange={(e) => {
                let value = e.target.value;

                // Tách phần năm từ giá trị datetime-local
                const [datePart, timePart] = value.split("T");
                const year = datePart.split("-")[0];

                // Kiểm tra nếu năm dài hơn 4 chữ số, cắt bớt chỉ lấy 4 chữ số
                if (year.length > 4) {
                  const newYear = year.slice(0, 4);
                  value = `${newYear}-${datePart.split("-")[1]}-${datePart.split("-")[2]}T${timePart}`;
                }
                setStartTime(value); // Set giá trị hợp lệ vào state
              }}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              disabled={viewMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {event && event.endTime ? (
              <p className="text-gray-500 ml-2 mt-1">
                Thời gian bắt đầu kết thúc:{" "}
                {formatDate.DD_MM_YYYY(event?.endTime)}
              </p>
            ) : (
              <></>
            )}
            <TextField
              label={
                <span>
                  Thời gian kết thúc <span style={{ color: "red" }}>*</span>
                </span>
              }
              type="datetime-local"
              fullWidth
              value={endTime}
              onChange={(e) => {
                let value = e.target.value;

                // Tách phần năm từ giá trị datetime-local
                const [datePart, timePart] = value.split("T");
                const year = datePart.split("-")[0];

                // Kiểm tra nếu năm dài hơn 4 chữ số, cắt bớt chỉ lấy 4 chữ số
                if (year.length > 4) {
                  const newYear = year.slice(0, 4);
                  value = `${newYear}-${datePart.split("-")[1]}-${datePart.split("-")[2]}T${timePart}`;
                }
                setEndTime(value); // Set giá trị hợp lệ vào state
              }}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              disabled={viewMode}
            />
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <TextField
              label="Ngày"
              type="number"
              fullWidth
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              disabled
            />
          </Grid> */}
          {/* <Grid item xs={12} sm={4}>
            <TextField
              label="Giờ"
              type="number"
              fullWidth
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Phút"
              type="number"
              fullWidth
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              disabled
            />
          </Grid> */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={
                <span>
                  Chi phí dự tính <span style={{ color: "red" }}>*</span>
                </span>
              }
              // type="number"
              className="mt-3"
              fullWidth
              value={formatCurrencyVND(fee)}
              onChange={(e) => {
                const numericValue = Number(
                  e.target.value.replace(/[^\d]/g, "")
                );
                setFee(numericValue);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₫</InputAdornment>
                ),
              }}
              disabled={
                viewMode ||
                (processData &&
                  processData.status != EventProcessStatus.Wait_Approval)
              }
            />
          </Grid>
          {processData && status != EventProcessStatus.Wait_Approval ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={
                    <span>
                      Chi phí thực tế <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  // type="number"
                  className="mt-3"
                  fullWidth
                  value={formatCurrencyVND(actualFee)}
                  onChange={(e) => {
                    const numericValue = Number(
                      e.target.value.replace(/[^\d]/g, "")
                    );
                    setActualFee(numericValue);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₫</InputAdornment>
                    ),
                  }}
                  disabled={
                    viewMode || status == EventProcessStatus.Wait_Approval
                  }
                />
              </Grid>
            </>
          ) : (
            <></>
          )}
          <Grid item xs={12} sm={12}>
            <label htmlFor="" className="ml-2 text-gray-500 text-[0.8rem] ">
              Ghi chú
            </label>
            <TextField
              type="text"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={viewMode}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "rgba(0, 0, 0)",
                  WebkitTextFillColor: "rgba(0, 0, 0)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                },
              }}
            />
          </Grid>
          {processData ? (
            <>
              <Grid item xs={12} sm={12}>
                <label
                  htmlFor=""
                  className="ml-2 text-gray-500 text-[0.8rem] mt-0"
                >
                  Trạng thái <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  aria-label="Trạng thái"
                  className="border-1 border-gray-300 rounded w-[100%] mt-0"
                  options={
                    processData.status == EventProcessStatus.Wait_Approval
                      ? [
                          {
                            value: EventProcessStatus.Wait_Approval,
                            label: EventProcessStringStatus.Wait_Approval,
                          },
                        ]
                      : processData.status == EventProcessStatus.Approval
                        ? [
                            {
                              value: EventProcessStatus.Approval,
                              label: EventProcessStringStatus.Approval,
                            },
                            {
                              value: EventProcessStatus.In_Progress,
                              label: EventProcessStringStatus.In_Progress,
                            },
                            {
                              value: EventProcessStatus.Cancelled,
                              label: EventProcessStringStatus.Cancelled,
                            },
                          ]
                        : [
                            {
                              value: EventProcessStatus.In_Progress,
                              label: EventProcessStringStatus.In_Progress,
                            },
                            {
                              value: EventProcessStatus.Completed,
                              label: EventProcessStringStatus.Completed,
                            },
                            {
                              value: EventProcessStatus.Cancelled,
                              label: EventProcessStringStatus.Cancelled,
                            },
                          ]
                  }
                  isMulti={false}
                  value={[
                    {
                      value: EventProcessStatus.Wait_Approval,
                      label: EventProcessStringStatus.Wait_Approval,
                    },
                    {
                      value: EventProcessStatus.Not_Approval,
                      label: EventProcessStringStatus.Not_Approval,
                    },
                    {
                      value: EventProcessStatus.Approval,
                      label: EventProcessStringStatus.Approval,
                    },
                    {
                      value: EventProcessStatus.In_Progress,
                      label: EventProcessStringStatus.In_Progress,
                    },
                    {
                      value: EventProcessStatus.Completed,
                      label: EventProcessStringStatus.Completed,
                    },
                    {
                      value: EventProcessStatus.Cancelled,
                      label: EventProcessStringStatus.Cancelled,
                    },
                  ].find((item) => item.value == status)}
                  onChange={(newValue: any) => {
                    setStatus(newValue.value);
                  }}
                  placeholder="Chọn trạng thái..."
                  isDisabled={
                    viewMode || status == EventProcessStatus.Wait_Approval
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: "white",
                      color: "rgba(0, 0, 0, 0.87)", // Màu chữ chính
                      borderColor: viewMode ? "#e0e0e0" : "#dcdcdc", // Màu viền khi ở chế độ xem
                      boxShadow: "none", // Bỏ shadow mặc định
                      "&:hover": {
                        borderColor: viewMode ? "#e0e0e0" : "#bdbdbd", // Màu viền khi hover
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#1976d2"
                        : state.isFocused
                          ? "#f0f0f0"
                          : "white", // Màu nền của option khi chọn hoặc hover
                      color: state.isSelected ? "white" : "rgba(0, 0, 0, 0.87)", // Màu chữ
                      cursor: "pointer",
                      "&:active": {
                        backgroundColor: "#1976d2", // Màu nền khi click
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      padding: "10px 5px",
                      color: `${
                        status == EventProcessStatus.In_Progress
                          ? "rgba(0, 0, 0, 0.87)"
                          : `white`
                      }`,
                      background: `${
                        status == EventProcessStatus.Wait_Approval
                          ? "black"
                          : `${
                              status == EventProcessStatus.In_Progress
                                ? "yellow"
                                : `${
                                    status == EventProcessStatus.Completed
                                      ? "green"
                                      : `${
                                          status == EventProcessStatus.Approval
                                            ? "blue"
                                            : `${
                                                status ==
                                                EventProcessStatus.Not_Approval
                                                  ? "red"
                                                  : `${
                                                      status ==
                                                      EventProcessStatus.Cancelled
                                                        ? "red"
                                                        : ""
                                                    }`
                                              }`
                                        }`
                                  }`
                            }`
                      }`,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "rgba(0, 0, 0, 0.38)", // Màu chữ cho placeholder
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: "rgba(0, 0, 0, 0.54)", // Màu icon mũi tên
                      "&:hover": {
                        color: "rgba(0, 0, 0, 0.87)", // Màu icon khi hover
                      },
                    }),
                  }}
                />
              </Grid>
              {(processData.status == EventProcessStatus.In_Progress ||
                processData.status == EventProcessStatus.Approval) &&
              (status == EventProcessStatus.Completed ||
                status == EventProcessStatus.Cancelled) ? (
                <div className="px-4 mt-3 mb-2">
                  <label
                    className="block mb-1 text-sm font-medium"
                    htmlFor="images"
                  >
                    Ảnh chứng minh
                  </label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    {"Tải lên các ảnh chứng minh (nếu có)"}
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium">
                        Xem trước ảnh đã chọn:
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-auto rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)} // Gọi hàm xóa ảnh
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              &times; {/* Biểu tượng xóa */}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <></>
              )}
              {(processData.status == EventProcessStatus.Completed ||
                processData.status == EventProcessStatus.Cancelled) &&
              processData.receiptImages &&
              processData.receiptImages.length > 0 ? (
                <div className="px-4 mt-3 mb-2">
                  <p className="mb-2">
                    Ảnh chứng minh:{" "}
                    <strong> {processData.receiptImages.length} ảnh</strong>
                  </p>
                  {processData.receiptImages.map((preview: any, index: any) => (
                    <div key={index} className="relative">
                      <img
                        src={preview.imageUrl ?? ""}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-auto rounded-lg border border-gray-300"
                      />
                      <hr className="my-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
          {/* <Grid item xs={12} sm={6}>
            <TextField
              label="End Time"
              type="datetime-local"
              fullWidth
              value={endTime ? DateTime.fromJSDate(endTime).toISO() : ""}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </Grid> */}
        </Grid>
        <Grid item xs={12} sm={12}>
          <MemberOfProcessDialog
            eventId={eventId}
            processId={processData ? processData.id : ""}
            ref={childRef}
            viewMode={viewMode}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        {viewMode &&
        processData &&
        processData.status != EventProcessStatus.Completed &&
        processData.status != EventProcessStatus.Cancelled &&
        processData.status != EventProcessStatus.Not_Approval ? (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setViewMode(false);
              }}
              color="primary"
            >
              Chỉnh sửa
            </Button>
          </>
        ) : (
          <></>
        )}
        <Button
          variant={!viewMode ? "contained" : "outlined"}
          onClick={() => {
            handleCloseDialog();
          }}
          color="secondary"
        >
          {!viewMode ? <>Hủy bỏ</> : <>Đóng</>}
        </Button>
        {!viewMode ? (
          <>
            <Button variant="contained" onClick={handleSubmit} color="primary">
              {processData ? "Cập nhật" : "Tạo"}
            </Button>
          </>
        ) : (
          <></>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventProcessDialog;
