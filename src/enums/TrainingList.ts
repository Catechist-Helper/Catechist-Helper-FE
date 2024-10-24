export enum trainingListStatus {
    START = 0, 
    FINISH = 1, 
  }
  
  export const trainingListStatusLabel: { [key in trainingListStatus]: string } = {
    [trainingListStatus.START]: "Đào tạo",
    [trainingListStatus.FINISH]: "Kết thúc",
  };
  