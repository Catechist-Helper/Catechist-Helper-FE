export enum pastoralYearStatus {
    START = 0, 
    FINISH = 1, 
  }
  
  export const pastoralYearStatusLabel: { [key in pastoralYearStatus]: string } = {
    [pastoralYearStatus.START]: "Bắt đầu",
    [pastoralYearStatus.FINISH]: "Kết thúc",
  };
  