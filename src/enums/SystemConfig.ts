export enum SystemConfigKey {
    RestrictedUpdateDaysBeforeInterview = "RestrictedUpdateDaysBeforeInterview",
    START_DATE = "startdate",
    END_DATE = "enddate",
    WEEKDAY = "weekday",
    START_TIME = "starttime",
    END_TIME = "endtime",
    RestrictedDateManagingCatechism = "RestrictedDateManagingCatechism",
}
 
// Map ánh xạ giá trị enum với chuỗi mô tả
const enumDescriptions: Record<SystemConfigKey, string> = {
    [SystemConfigKey.RestrictedUpdateDaysBeforeInterview]: "Số ngày tối thiểu trước lịch phỏng vấn",
    [SystemConfigKey.START_DATE]: "Ngày bắt đầu các lớp giáo lý",
    [SystemConfigKey.END_DATE]: "Ngày kết thúc các lớp giáo lý",
    [SystemConfigKey.WEEKDAY]: "Ngày học trong tuần của các lớp giáo lý",
    [SystemConfigKey.START_TIME]: "Thời gian bắt đầu các tiết học giáo lý",
    [SystemConfigKey.END_TIME]: "Thời gian kết thúc các tiết học giáo lý",
    [SystemConfigKey.RestrictedDateManagingCatechism]: "Ngày giới hạn quản lý nghiệp vụ giáo lý",
};

// Hàm nhận giá trị enum và trả về chuỗi mô tả
export function getSystemConfigEnumDescription(value: SystemConfigKey): string {
    return enumDescriptions[value] || "Không xác định";
}