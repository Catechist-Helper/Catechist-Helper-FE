// src/model/Request/SlotRequest.ts

export type CatechistInSlotRequest = {
  catechistId: string;
  isMain: boolean;
};

export type CreateSlotRequest = {
  classId: string;
  roomId: string;
  catechists: CatechistInSlotRequest[];
};
