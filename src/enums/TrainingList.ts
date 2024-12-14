export enum trainingListStatus {
    NotStarted = 0,
    Training = 1, 
    Finished = 2, 
  }
  
  export const trainingListStatusLabel: { [key in trainingListStatus]: string } = {
    [trainingListStatus.NotStarted]: "Chưa bắt đầu",
    [trainingListStatus.Training]: "Đào tạo",
    [trainingListStatus.Finished]: "Kết thúc",
  };

  export enum trainingListStatusString {
    NotStarted = "Chưa bắt đầu",
    Training = "Đào tạo", 
    Finished = "Kết thúc", 
  }
  