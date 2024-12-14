export enum catechistInTrainingStatus {
    NotStarted = 0,
    Training = 1,
    Completed = 2,
    Failed = 3
}

export const catechistInTrainingStatusLabel: { [key in catechistInTrainingStatus]: string } = {
    [catechistInTrainingStatus.NotStarted]: "Chưa đào tạo",
    [catechistInTrainingStatus.Training]: "Đang đào tạo",
    [catechistInTrainingStatus.Completed]: "Hoàn thành",
    [catechistInTrainingStatus.Failed]: "Không đạt",
};
