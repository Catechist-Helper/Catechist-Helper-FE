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
import { EventStatus, EventProcessStringStatus } from "../../../enums/Event";
import sweetAlert from "../../../utils/sweetAlert";
import MemberOfProcessDialog, {
  MemberOfProcessDialogHandle,
} from "./MemberOfProcessDialog";

interface EventProcessDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  processData?: any; // Thêm kiểu dữ liệu nếu cần
  viewModeDialog?: boolean;
}

const EventProcessDialog: React.FC<EventProcessDialogProps> = ({
  open,
  onClose,
  eventId,
  processData,
  viewModeDialog,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [fee, setFee] = useState<number>(0);
  const [actualFee, setActualFee] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [status, setStatus] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [viewMode, setViewMode] = useState<boolean>(false);

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
    setDurationDays(0);
    setDurationHours(0);
    setDurationMinutes(0);
  };

  useEffect(() => {
    resetFields();
    if (processData) {
      console.log(processData);
      setName(processData.name);
      setDescription(processData.description);
      setStartTime(processData.startTime);
      setEndTime(processData.endTime);
      setFee(processData.fee);
      setActualFee(processData.actualFee);
      setNote(processData.note);
      setStatus(processData.status);
      setViewMode(viewModeDialog ? true : false);
      const duration =
        new Date(processData.endTime).getTime() -
        new Date(processData.startTime).getTime();
      let days = Math.floor(duration / (1000 * 60 * 60 * 24)); // Số ngày
      let hours = Math.floor(
        (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ); // Số giờ
      let minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60)); // Số phút
      setDurationDays(days);
      setDurationHours(hours);
      setDurationMinutes(minutes);
    }
  }, [processData]);

  // Hàm tính lại thời gian kết thúc
  const handleStartTimeChange = (date: string) => {
    setStartTime(date);
    // const startParse = new Date(date);
    // if (
    //   date &&
    //   durationDays >= 0 &&
    //   durationHours >= 0 &&
    //   durationMinutes >= 0
    // ) {
    //   const durationInMillis =
    //     durationDays * 24 * 60 * 60 * 1000 +
    //     durationHours * 60 * 60 * 1000 +
    //     durationMinutes * 60 * 1000;
    //   const end = new Date(startParse.getTime() + durationInMillis);
    //   setEndTime(end.toISOString());
    // }
  };

  const handleEndimeChange = (date: string) => {
    setEndTime(date);
    // const startParse = new Date(date);
    // if (
    //   date &&
    //   durationDays >= 0 &&
    //   durationHours >= 0 &&
    //   durationMinutes >= 0
    // ) {
    //   const durationInMillis =
    //     durationDays * 24 * 60 * 60 * 1000 +
    //     durationHours * 60 * 60 * 1000 +
    //     durationMinutes * 60 * 1000;
    //   const end = new Date(startParse.getTime() + durationInMillis);
    //   setEndTime(end.toISOString());
    // }
  };

  useEffect(() => {
    setDurationDays(0);
    setDurationHours(0);
    setDurationMinutes(0);

    if (startTime && endTime && startTime != "" && endTime != "") {
      // Chuyển đổi startDate và endDate sang đối tượng Date
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      // Tính sự chênh lệch giữa hai thời gian (millisecond)
      const diffInMilliseconds = end - start;

      if (diffInMilliseconds <= 0) {
        sweetAlert.alertFailed(
          "Thời gian kết thúc phải sau hơn thời gian bắt đầu",
          "",
          5000,
          30
        );
      } else {
        // Tính toán số ngày, giờ, phút từ chênh lệch
        const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );

        // Lưu vào các state
        setDurationDays(days);
        setDurationHours(hours);
        setDurationMinutes(minutes);
      }
    }
  }, [startTime, endTime]);

  // Hàm để validate form trước khi submit
  const handleSubmit = async () => {
    if (!startTime || new Date(startTime).getTime() <= new Date().getTime()) {
      alert("Start time must be in the future.");
      return;
    }
    if (fee < 0) {
      alert("Fee cannot be negative.");
      return;
    }
    if (
      endTime &&
      new Date(endTime).getTime() <=
        new Date(startTime).getTime() + 1 * 60 * 1000
    ) {
      alert("End time must be greater than start time by at least 1 minute.");
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
    };
    console.log(data);

    try {
      let createdProcessId = "";
      if (processData) {
        // Update process
        await processApi.updateProcess(processData.id, data);
        createdProcessId = processData.id;
      } else {
        // Create new process
        data.actualFee = data.fee;
        data.status = EventStatus.Not_Started;
        const createdDataRes = await processApi.createProcess(data);
        createdProcessId = createdDataRes.data.data.id;
      }
      childRef.current?.handleChangeMemberOfProcess(createdProcessId);
      onClose(); // Close the dialog after successful submission
    } catch (error) {
      console.error("Error creating/updating process:", error);
      alert("An error occurred while creating/updating the process.");
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
              label={`Tên hoạt động`}
              className="mt-2"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          <Grid item xs={12} sm={6}>
            <label htmlFor="" className="ml-2 text-gray-500 text-[0.8rem] ">
              Thời gian bắt đầu
            </label>
            <input
              className="w-full rounded py-2 px-2 border-1 border-gray-400"
              placeholder="Start Time"
              type="datetime-local"
              value={startTime ?? ""}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              disabled={viewMode}
              style={{
                color: "rgba(0, 0, 0) !important",
                WebkitTextFillColor: "rgba(0, 0, 0) !important",
                opacity: 1,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <label htmlFor="" className="ml-2 text-gray-500 text-[0.8rem] ">
              Thời gian kết thúc
            </label>
            <input
              className="w-full rounded py-2 px-2 border-1 border-gray-400"
              placeholder="Start Time"
              type="datetime-local"
              value={endTime ?? ""}
              onChange={(e) => handleEndimeChange(e.target.value)}
              disabled={viewMode}
              style={{
                color: "rgba(0, 0, 0) !important",
                WebkitTextFillColor: "rgba(0, 0, 0) !important",
                opacity: 1,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Ngày"
              type="number"
              fullWidth
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Giờ"
              type="number"
              fullWidth
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                },
              }}
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
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                  opacity: 1,
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "rgba(0, 0, 0, 0.6)",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Chi phí dự tính"
              type="number"
              className="mt-3"
              fullWidth
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₫</InputAdornment>
                ),
              }}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Chi phí thực tế"
                  type="number"
                  className="mt-3"
                  fullWidth
                  value={actualFee}
                  onChange={(e) => setActualFee(Number(e.target.value))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₫</InputAdornment>
                    ),
                  }}
                  disabled={viewMode}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      color: "rgba(0, 0, 0)",
                      WebkitTextFillColor: "rgba(0, 0, 0)",
                      opacity: 1,
                    },
                    "& .MuiInputLabel-root.Mui-disabled": {
                      color: "rgba(0, 0, 0)",
                    },
                  }}
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
                  Trạng thái
                </label>
                <Select
                  aria-label="Trạng thái"
                  className="border-1 border-gray-300 rounded w-[100%] mt-0"
                  options={
                    status == EventStatus.Not_Started
                      ? [
                          {
                            value: EventStatus.Not_Started,
                            label: EventProcessStringStatus.Not_Started,
                          },
                          {
                            value: EventStatus.In_Progress,
                            label: EventProcessStringStatus.In_Progress,
                          },
                          {
                            value: EventStatus.Completed,
                            label: EventProcessStringStatus.Completed,
                          },
                          {
                            value: EventStatus.Cancelled,
                            label: EventProcessStringStatus.Cancelled,
                          },
                        ]
                      : [
                          {
                            value: EventStatus.In_Progress,
                            label: EventProcessStringStatus.In_Progress,
                          },
                          {
                            value: EventStatus.Completed,
                            label: EventProcessStringStatus.Completed,
                          },
                          {
                            value: EventStatus.Cancelled,
                            label: EventProcessStringStatus.Cancelled,
                          },
                        ]
                  }
                  isMulti={false}
                  value={[
                    {
                      value: EventStatus.Not_Started,
                      label: EventProcessStringStatus.Not_Started,
                    },
                    {
                      value: EventStatus.In_Progress,
                      label: EventProcessStringStatus.In_Progress,
                    },
                    {
                      value: EventStatus.Completed,
                      label: EventProcessStringStatus.Completed,
                    },
                    {
                      value: EventStatus.Cancelled,
                      label: EventProcessStringStatus.Cancelled,
                    },
                  ].find((item) => item.value == status)}
                  onChange={(newValue: any) => {
                    setStatus(newValue.value);
                  }}
                  placeholder="Chọn trạng thái..."
                  isDisabled={viewMode}
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
                      color: "rgba(0, 0, 0, 0.87)", // Màu chữ khi chọn
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
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            handleCloseDialog();
          }}
          color="secondary"
        >
          {!viewMode ? <>Hủy bỏ</> : <>Đóng</>}
        </Button>
        {viewMode && processData ? (
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
