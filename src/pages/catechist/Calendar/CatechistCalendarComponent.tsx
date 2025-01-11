import { useEffect } from "react";
import Calendar from "../../common/Calendar/Calendar";
import { storeCurrentPath } from "../../../utils/utils";
import { PATH_CATECHIST } from "../../../routes/paths";

const CatechistCalendarComponent = () => {
  useEffect(() => {
    storeCurrentPath(PATH_CATECHIST.catechist_calendar);
  }, []);

  return <Calendar />;
};

export default CatechistCalendarComponent;
