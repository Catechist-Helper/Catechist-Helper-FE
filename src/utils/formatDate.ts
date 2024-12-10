import moment from 'moment';

const YYYY_MMMM_DD = (dateStr: string) => moment(dateStr).format('YYYY, MMMM DD');

const YYYY_MMMM_DD_Time = (dateStr: string) => moment(dateStr).format('YYYY MMMM DD, HH:mm');

const DD_MM_YYYY = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY');

const YYYY_YYYY = (startYear: string, endYear: string) => `${moment(startYear).format('YYYY')}-${moment(endYear).format('YYYY')}`;

const DD_MM_YYYY_Time = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY, HH:mm');

const HH_mm = (dateStr: string) => moment(dateStr).format('HH:mm');

const getISODateInVietnamTimeZone = () => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const [year, month, day, hour, minute, second] = [
      parts.find((p) => p.type === "year")?.value,
      parts.find((p) => p.type === "month")?.value,
      parts.find((p) => p.type === "day")?.value,
      parts.find((p) => p.type === "hour")?.value,
      parts.find((p) => p.type === "minute")?.value,
      parts.find((p) => p.type === "second")?.value,
    ];

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

export const formatDate = {
    YYYY_MMMM_DD,
    YYYY_MMMM_DD_Time,
    DD_MM_YYYY,
    YYYY_YYYY,
    DD_MM_YYYY_Time,
    HH_mm,
    getISODateInVietnamTimeZone
}