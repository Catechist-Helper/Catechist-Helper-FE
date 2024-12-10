import { useState, useEffect } from "react";
import Calendar, { EventCalendar } from "../../common/Calendar/Calendar";
import { getUserInfo } from "../../../utils/utils";
import eventApi from "../../../api/Event";
import classApi from "../../../api/Class";
import catechistInClassApi from "../../../api/CatechistInClass";
import processApi from "../../../api/EventProcess";
import useAppContext from "../../../hooks/useAppContext";

const CatechistCalendarComponent = () => {
  const [userLogin, setUserLogin] = useState<any>(null);
  const [finishFetchData, setFinishFetchData] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<EventCalendar[]>([]);
  const { enableLoading, disableLoading } = useAppContext();

  const fetchClassesSlotData = async () => {
    try {
      const firstRes =
        await catechistInClassApi.getClassesRemainingSlotsOfCatechist(
          userLogin.catechistId
        );
      firstRes.data.data.forEach((item) => {
        const action = async () => {
          const secondRes = await classApi.getSlotsOfClass(item.id, 1, 1000);
          secondRes.data.data.items.forEach((item2) => {
            if (
              item2.catechistInSlots &&
              item2.catechistInSlots.find(
                (item3) =>
                  item3.catechist && item3.catechist.id == userLogin.catechistId
              )
            ) {
              setCalendarEvents((prev) => [
                ...prev,
                {
                  title: `[Tiết học] - ${item.name}`,
                  description: `${item2.room && item2.room.name ? `Địa điểm dạy: Phòng ${item2.room.name}` : ""}\n`,
                  start:
                    item2.date.split("T")[0] +
                    "T" +
                    item2.startTime.split("T")[1],
                  end:
                    item2.date.split("T")[0] +
                    "T" +
                    item2.endTime.split("T")[1],
                },
              ]);
            }
          });
        };
        action();
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFinishFetchData(true);
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
        const action = async () => {
          const eventMemRes = await eventApi.getEventMembers(item.id, 1, 1000);
          const checkCatechistInEvent = eventMemRes.data.data.items.find(
            (item) => item.account && item.account.id == userLogin.id
          )
            ? true
            : false;
          if (checkCatechistInEvent) {
            setCalendarEvents((prev) => [
              ...prev,
              {
                title: `[Sự kiện] - ${item.name}`,
                description: `${item.description}\n`,
                start: item.startTime,
                end: item.endTime,
              },
            ]);

            const processesRes = await eventApi.getEventProcesses(
              item.id,
              1,
              1000
            );
            processesRes.data.data.items.forEach((process) => {
              const action2 = async () => {
                const processMemeberRes = await processApi.getMembersOfProcess(
                  process.id,
                  process.id,
                  1,
                  1000
                );
                if (
                  processMemeberRes.data.data.items.find(
                    (member) => member.getAccountResponse.id == userLogin.id
                  )
                ) {
                  setCalendarEvents((prev) => [
                    ...prev,
                    {
                      title: `[HĐSK] - Hoạt động của ${item.name}`,
                      description: `Tên hoạt động: ${process.name}
                Mô tả: ${process.description}`,
                      start: process.startTime,
                      end: process.endTime,
                    },
                  ]);
                }
              };
              action2();
            });
          }
        };
        action();
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setTimeout(() => {
        fetchClassesSlotData();
      }, 500);
    }
  };

  // Fetch thông tin người dùng đã đăng nhập
  useEffect(() => {
    enableLoading();
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

  useEffect(() => {
    if (finishFetchData) {
      disableLoading();
    }
  }, [finishFetchData]);

  useEffect(() => {
    if (userLogin) {
      fetchAllEvents();
    }
  }, [userLogin]);

  if (!userLogin || !finishFetchData) return <></>;

  return <Calendar events={calendarEvents} />;
};

export default CatechistCalendarComponent;
