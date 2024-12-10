import { useState, useEffect } from "react";
import Calendar, { EventCalendar } from "../../common/Calendar/Calendar";
import eventApi from "../../../api/Event";
import classApi from "../../../api/Class";
import useAppContext from "../../../hooks/useAppContext";

const AdminCalendarComponent = () => {
  const [finishFetchData, setFinishFetchData] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendar[]>([]);
  const { enableLoading, disableLoading } = useAppContext();

  const fetchClassesSlotData = async () => {
    try {
      const preFirstRes = await classApi.getAllClasses();
      const firstRes = await classApi.getAllClasses(
        undefined,
        undefined,
        undefined,
        1,
        preFirstRes.data.data.total
      );
      let finalList: EventCalendar[] = [];
      firstRes.data.data.items.forEach(async (item) => {
        const action = async () => {
          const secondRes = await classApi.getSlotsOfClass(item.id, 1, 1000);
          secondRes.data.data.items.forEach((item2) => {
            let indexExistTimeItem = finalList.findIndex(
              (findItem) =>
                findItem.start ==
                  item2.date.split("T")[0] +
                    "T" +
                    item2.startTime.split("T")[1] &&
                findItem.end ==
                  item2.date.split("T")[0] + "T" + item2.endTime.split("T")[1]
            );

            if (indexExistTimeItem >= 0) {
              const newItem: EventCalendar = {
                ...finalList[indexExistTimeItem],
                description:
                  finalList[indexExistTimeItem].description +
                  `\n\n- ${item.name} - Phòng học: ${item2.room.name}
              Khối: ${item.gradeName} - Ngành: ${item.majorName}`,
              };
              finalList.splice(indexExistTimeItem, 1);
              finalList.push(newItem);
            } else {
              finalList.push({
                title: "[Lịch giáo lý] - Lịch học các lớp giáo lý",
                description: `Thông tin các lớp học:

              - ${item.name} - Phòng học: ${item2.room.name}
              Khối: ${item.gradeName} - Ngành: ${item.majorName}`,
                start:
                  item2.date.split("T")[0] +
                  "T" +
                  item2.startTime.split("T")[1],
                end:
                  item2.date.split("T")[0] + "T" + item2.endTime.split("T")[1],
                widthDialog: "md",
              });
            }
          });
        };

        await action();
        console.log("finalList", finalList);
        setCalendarEvents(finalList);
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      fetchAllEvents();
    }
  };

  const fetchAllEvents = async () => {
    // let eventsList: EventItemResponse[] = [];
    try {
      const firstRes = await eventApi.getAllEvents();
      const secondRes = await eventApi.getAllEvents(
        undefined,
        1,
        firstRes.data.data.total
      );
      secondRes.data.data.items.forEach((item) => {
        setCalendarEvents((prev) => [
          ...prev,
          {
            title: `[Sự kiện] - ${item.name}`,
            description: `${item.description}\n`,
            start: item.startTime,
            end: item.endTime,
          },
        ]);
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setFinishFetchData(true);
    }
  };

  // Fetch thông tin người dùng đã đăng nhập
  useEffect(() => {
    enableLoading();
    fetchClassesSlotData();
  }, []);

  useEffect(() => {
    if (finishFetchData) {
      disableLoading();
    }
  }, [finishFetchData]);

  if (!finishFetchData) return <></>;

  return <Calendar events={calendarEvents} />;
};

export default AdminCalendarComponent;
