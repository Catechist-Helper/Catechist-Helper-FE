import { useEffect } from "react";
import Calendar from "../../common/Calendar/Calendar";
import { storeCurrentPath } from "../../../utils/utils";
import { PATH_ADMIN } from "../../../routes/paths";

const AdminCalendarComponent = () => {
  useEffect(() => {
    storeCurrentPath(PATH_ADMIN.admin_calendar);
  }, []);

  return <Calendar />;
};

export default AdminCalendarComponent;
