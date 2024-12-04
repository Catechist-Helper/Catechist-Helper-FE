import React, { useEffect, useState } from "react";
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
import processApi from "../../../api/EventProcess";
import {
  CreateProcessRequest,
  UpdateProcessRequest,
} from "../../../model/Request/EventProcess"; // Import đúng model request

interface EventProcessDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  processData?: any; // Thêm kiểu dữ liệu nếu cần
}

const EventProcessDialog: React.FC<EventProcessDialogProps> = ({
  open,
  onClose,
  eventId,
  processData,
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

  useEffect(() => {
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
    const startParse = new Date(date);
    if (
      date &&
      durationDays >= 0 &&
      durationHours >= 0 &&
      durationMinutes >= 0
    ) {
      const durationInMillis =
        durationDays * 24 * 60 * 60 * 1000 +
        durationHours * 60 * 60 * 1000 +
        durationMinutes * 60 * 1000;
      const end = new Date(startParse.getTime() + durationInMillis);
      setEndTime(end.toISOString());
    }
  };

  useEffect(() => {
    if (startTime) {
      const startParse = new Date(startTime + "Z");
      const durationInMillis =
        durationDays * 24 * 60 * 60 * 1000 +
        durationHours * 60 * 60 * 1000 +
        durationMinutes * 60 * 1000;
      const end = new Date(startParse.getTime() + durationInMillis);
      setEndTime(end.toISOString());
      console.log(
        "aaa",
        durationDays,
        durationHours,
        durationMinutes,
        startTime
      );
      console.log("bbbbbb", end.toISOString());
    }
  }, [startTime, durationDays, durationHours, durationMinutes]);

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
      if (processData) {
        // Update process
        await processApi.updateProcess(processData.id, data);
      } else {
        // Create new process
        data.actualFee = data.fee;
        await processApi.createProcess(data);
      }
      onClose(); // Close the dialog after successful submission
    } catch (error) {
      console.error("Error creating/updating process:", error);
      alert("An error occurred while creating/updating the process.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {processData ? "Update Process" : "Create Process"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Process Name"
              className="mt-2"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <input
              className="w-full rounded mt-1 py-2 px-2"
              placeholder="Start Time"
              type="datetime-local"
              value={startTime ?? ""}
              onChange={(e) => handleStartTimeChange(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Duration (Days)"
              type="number"
              fullWidth
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Duration (Hours)"
              type="number"
              fullWidth
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Duration (Minutes)"
              type="number"
              fullWidth
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fee"
              type="number"
              fullWidth
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₫</InputAdornment>
                ),
              }}
            />
          </Grid>
          {processData ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ActualFee"
                  type="number"
                  fullWidth
                  value={actualFee}
                  onChange={(e) => setActualFee(Number(e.target.value))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₫</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          ) : (
            <></>
          )}
          <Grid item xs={12} sm={12}>
            <TextField
              label="Note"
              type="string"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Grid>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          {processData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventProcessDialog;
