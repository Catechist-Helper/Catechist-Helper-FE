import React, { useState, useEffect } from "react";
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
import { formatDate } from "../../../utils/formatDate";

export type EventCalendar = {
  title: string;
  description: string;
  start: string;
  end?: string;
  widthDialog?: "md" | "lg" | "xs" | "sm" | "xl";
};

// const eventsInitData: EventCalendar[] = [
//   {
//     title: "Meeting with Team",
//     description: "Discuss project progress",
//     start: "2024-12-10T10:00:00",
//   },
//   {
//     title: "Project Deadline",
//     description: "Submit final report",
//     start: "2024-12-15",
//   },
//   {
//     title: "Conference",
//     description: "Attend tech conference",
//     start: "2024-12-20",
//     end: "2024-12-22",
//   },
// ];

interface CalendarComponentProps {
  events: EventCalendar[];
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ events }) => {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCalendar | null>(
    null
  );
  const [eventList, setEventList] = useState<EventCalendar[]>([]);

  useEffect(() => {
    setEventList([...events]);
  }, [events]);

  const handleEventClick = (info: { event: any }) => {
    const clickedEvent: EventCalendar = {
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
        events={eventList}
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
        fullWidth
        maxWidth={
          selectedEvent && selectedEvent.widthDialog
            ? selectedEvent.widthDialog
            : "sm"
        }
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
              <div
                style={{ whiteSpace: "pre-line" }}
                dangerouslySetInnerHTML={{
                  __html: selectedEvent?.description ?? "",
                }}
              ></div>
            </Typography>
            <Divider />
            <Box>
              <div className="flex gap-x-2">
                <Typography variant="body2" fontWeight="bold">
                  Bắt đầu:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDate.HH_mm(
                    new Date(selectedEvent?.start || "").toString()
                  ) == "00:00" ? (
                    <>
                      {formatDate.DD_MM_YYYY(
                        new Date(selectedEvent?.start || "").toString()
                      )}
                    </>
                  ) : (
                    <>
                      {formatDate.DD_MM_YYYY_Time(
                        new Date(selectedEvent?.start || "").toString()
                      )}
                    </>
                  )}
                </Typography>
              </div>
            </Box>
            {selectedEvent?.end && (
              <Box>
                <div className="flex gap-x-2">
                  <Typography variant="body2" fontWeight="bold">
                    Kết thúc:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatDate.HH_mm(
                      new Date(selectedEvent?.end || "").toString()
                    ) == "00:00" ? (
                      <>
                        {formatDate.DD_MM_YYYY(
                          new Date(selectedEvent?.end || "").toString()
                        )}
                      </>
                    ) : (
                      <>
                        {formatDate.DD_MM_YYYY_Time(
                          new Date(selectedEvent?.end || "").toString()
                        )}
                      </>
                    )}
                  </Typography>
                </div>
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

export default CalendarComponent;
