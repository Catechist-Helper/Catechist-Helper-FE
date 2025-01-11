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
import accountApi from "../../../api/Account";

export type EventCalendar = {
  title: string;
  description: string;
  start: string;
  end?: string;
};

const CalendarComponent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCalendar | null>(
    null
  );
  const [eventList, setEventList] = useState<EventCalendar[]>([]);

  const fetchClassesSlotData = async () => {
    try {
      const userInfo = JSON.parse(
        window.localStorage.getItem("USER_INFO") || "{}"
      );
      const id = userInfo.id || null;

      if (!id) {
        console.error("User ID is not available in local storage.");
        return;
      }

      // Fetch calendar data
      const response = await accountApi.getCalendarOfAccount(id);

      if (response && response.data && Array.isArray(response.data.data)) {
        // Map the fetched events to the format required by FullCalendar
        const events = response.data.data.map((event: EventCalendar) => ({
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end || undefined,
        }));

        // Update the eventList state
        setEventList(events);
      } else {
        console.error("Unexpected API response structure or no data received.");
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };

  useEffect(() => {
    fetchClassesSlotData();
  }, []);

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

  const translateTitles = (events: EventCalendar[]): EventCalendar[] => {
    const translationMap: { [key: string]: string } = {
      Vesak: "Lễ Phật Đản",

      "Christmas Day": "Ngày Lễ Giáng Sinh",
      "Christmas Eve": "Đêm Vọng Giáng Sinh",

      "Easter Sunday": "Lễ Phục Sinh",

      "Day off for International New Year's Day":
        "Ngày Nghỉ Bù Cho Tết Dương Lịch",
      "International New Year's Day": "Tết Dương Lịch",
      "International New Year's Eve": "Đêm Giao Thừa Tết Dương Lịch",

      "Vietnamese New Year's Eve": "Đêm Giao Thừa Tết Nguyên Đán",
      "New Year's Eve": "Đêm Giao Thừa Năm Mới",
      "Vietnamese New Year": "Tết Nguyên Đán",
      "Tet Holiday": "Kỳ Nghỉ Tết",

      "Day off for Hung Kings Festival": "Ngày Nghỉ Bù Cho Giỗ Tổ Hùng Vương",
      "Hung Kings Festival": "Giỗ Tổ Hùng Vương",

      "Day off for Liberation Day/Reunification Day":
        "Ngày Nghỉ Bù Cho Ngày Giải Phóng Miền Nam",
      "Working day for Liberation Day Holiday":
        "Ngày Làm Việc Bù Cho Kỳ Nghỉ Giải Phóng",
      "Working Day for May 2": "Ngày Làm Việc Bù Cho Ngày Nghỉ 2/5",
      "Liberation Day/Reunification Day Holiday":
        "Ngày Nghỉ Lễ Giải Phóng Miền Nam",
      "Liberation Day/Reunification Day": "Ngày Giải Phóng Miền Nam",

      "Day off for International Labor Day":
        "Ngày Nghỉ Bù Cho Ngày Quốc Tế Lao Động",
      "International Labor Day": "Ngày Quốc Tế Lao Động",

      "Independence Day observed": "Ngày Nghỉ Quốc Khánh",
      "Independence Day Holiday": "Ngày Nghỉ Quốc Khánh",
      "Independence Day": "Ngày Quốc Khánh",
    };

    return events.map((event) => {
      const matchedKey = Object.keys(translationMap).find((key) =>
        event.title.includes(key)
      );

      if (matchedKey) {
        const vietnameseTitle = event.title.replace(
          matchedKey,
          translationMap[matchedKey]
        );
        return { ...event, title: vietnameseTitle };
      }

      return event;
    });
  };

  const translatedEvents = translateTitles(eventList);

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={viLocale}
        events={translatedEvents}
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
        maxWidth={"sm"}
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
