// src/model/Response/EventCategory.ts
export interface EventCategoryItemResponse {
    id: string;
    name: string;
    description: string;
  }
  
  export interface EventCategoryResponse {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: EventCategoryItemResponse[];
  }
  