export enum catechistInTrainingStatus {
    Training = 0,
    Completed = 1,
    Failed = 2
}

export const catechistInTrainingStatusLabel: { [key in catechistInTrainingStatus]: string } = {
    [catechistInTrainingStatus.Training]: "Đang đào tạo",
    [catechistInTrainingStatus.Completed]: "Hoàn thành",
    [catechistInTrainingStatus.Failed]: "Không đạt",
};

export enum catechistInTrainingStatusString {
    Training = "Đang đào tạo",
    Completed = "Hoàn thành",
    Failed = "Không đạt"
}
