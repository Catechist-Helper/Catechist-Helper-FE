import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base


const ROOT_ROOMS= "/rooms"

const getAllRoom = (page?: number, size?: number) =>
    request.get(`${ROOT_ROOMS}`, {
        params: {
            page,
            size
        }
    });

    const getById = (id: string) =>
        request.get(`${ROOT_ROOMS}/${id}`);
    
    
    const createRoom = (formData: FormData): Promise<AxiosResponse<any>> => 
         request.post(`${ROOT_ROOMS}`, formData);
    // const createRoom = async (formData: FormData): Promise<AxiosResponse<any>> => {
    //     return request.post(`${ROOT_ROOMS}`, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //       },
    //     });
    //   };
      
        
    const updateRoom = (id: string, name: string, description: string, image: string) : Promise<AxiosResponse<any>>=>
        request.put(`${ROOT_ROOMS}/${id}`, {
            name,
            description,
            image
        });
        
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

