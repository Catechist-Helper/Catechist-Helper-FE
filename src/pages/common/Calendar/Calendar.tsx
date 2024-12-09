import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import "./Calendar.css";

type Event = {
  title: string;
  description: string;
  start: string;
  end?: string;
};

const events: Event[] = [
  {
    title: "Meeting with Team",
    description: "Discuss project progress",
    start: "2024-12-10T10:00:00",
  },
  {
    title: "Project Deadline",
    description: "Submit final report",
    start: "2024-12-15",
  },
  {
    title: "Conference",
    description: "Attend tech conference",
    start: "2024-12-20",
    end: "2024-12-22",
  },
];

const Calendar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEventClick = (info: { event: any }) => {
    const clickedEvent: Event = {
      title: info.event.title,
      description: info.event.extendedProps.description,
      start: info.event.startStr,
      end: info.event.endStr,
    };
    setSelectedEvent(clickedEvent);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={viLocale}
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />

      {/* Event Details Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { borderRadius: "12px", padding: "10px" },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div" color="primary">
            Lịch cá nhân
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">{selectedEvent?.title}</Typography>
            <Typography variant="body1" color="textSecondary">
              {selectedEvent?.description || "Chưa có mô tả"}
            </Typography>
            <Divider />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Bắt đầu:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(selectedEvent?.start || "").toLocaleString()}
              </Typography>
            </Box>
            {selectedEvent?.end && (
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Kết thúc:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(selectedEvent?.end).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Calendar;
