export enum SystemConfigKey {
    START_DATE = "startdate",
    END_DATE = "enddate",
    START_TIME = "starttime",
    END_TIME = "endtime",
    WEEKDAY = "weekday",
    RestrictedUpdateDaysBeforeInterview = "RestrictedUpdateDaysBeforeInterview",
    RestrictedDateManagingCatechism = "RestrictedDateManagingCatechism"
}
 
// Map ánh xạ giá trị enum với chuỗi mô tả
const enumDescriptions: Record<SystemConfigKey, string> = {
    [SystemConfigKey.START_DATE]: "Ngày bắt đầu năm học",
    [SystemConfigKey.END_DATE]: "Ngày kết thúc năm học",
    [SystemConfigKey.START_TIME]: "Thời gian bắt đầu năm học",
    [SystemConfigKey.END_TIME]: "Thời gian kết thúc năm học",
    [SystemConfigKey.WEEKDAY]: "Ngày học của các lớp giáo lý",
    [SystemConfigKey.RestrictedUpdateDaysBeforeInterview]: "Số ngày giới hạn trước khi phỏng vấn",
    [SystemConfigKey.RestrictedDateManagingCatechism]: "Ngày giới hạn quản lý giáo lý",
};

// Hàm nhận giá trị enum và trả về chuỗi mô tả
export function getSystemConfigEnumDescription(value: SystemConfigKey): string {
    return enumDescriptions[value] || "Không xác định";
}