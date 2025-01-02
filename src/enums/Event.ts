export enum EventStatus {
    Not_Started,
    In_Progress,
    Completed,
    Cancelled
}

export enum EventStatusString {
    Not_Started = "Chưa bắt đầu",
    In_Progress = "Đang làm",
    Completed = "Hoàn thành",
    Cancelled = "Hủy bỏ"
}

export enum EventProcessStatus {
    Wait_Approval,
    Approval,
    In_Progress,
    Completed,
    Not_Approval,
    Cancelled
}

export enum EventProcessStringStatus {
    Wait_Approval = "Chờ phê duyệt",
    Approval = "Đã phê duyệt",
    In_Progress = "Đang làm",
    Completed = "Hoàn thành",
    Not_Approval = "Không duyệt",
    Cancelled = "Hủy bỏ",
}