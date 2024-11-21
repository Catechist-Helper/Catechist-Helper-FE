import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"
import { BasicResponse } from "../../model/Response/BasicResponse";
import { RoomResponse } from "../../model/Response/Room";

const request = axiosInstances.base


const ROOT_ROOMS= "/rooms"

const getAllRoom = (page?: number, size?: number, pastoralYearId?: string, excludeRoomAssigned?: boolean) =>
    request.get(`${ROOT_ROOMS}`, {
        params: {
          ...(page !== undefined && { page }),
          ...(size !== undefined && { size }),
            ...(pastoralYearId !== undefined && { pastoralYearId }),
            ...(excludeRoomAssigned !== undefined && { excludeRoomAssigned }),
        }
    });

    const getById = (id: string) =>
        request.get(`${ROOT_ROOMS}/${id}`);
    
    
    // POST: Tạo mới một room
const createRoom = async (data: FormData) => {
    return await request.post<BasicResponse<RoomResponse>>(`${ROOT_ROOMS}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  };
      
        
    const updateRoom = async (id: string, data: FormData): Promise<AxiosResponse<any>> => {
        return await request.put(`${ROOT_ROOMS}/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data', 
          },
        });
      };
      
        
    const deleteRoom = (id: string): Promise<AxiosResponse<any>> =>
            request.delete(`${ROOT_ROOMS}/${id}`);

    const roomsApi = {
        getAllRoom,
        getById,
        createRoom,
        updateRoom,
        deleteRoom
    };
    
    export default roomsApi;

