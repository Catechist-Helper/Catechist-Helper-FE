import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base

const ROOT_LEVEL = "/levels"

const getAllLevel = (page?: number, size?: number) =>
    request.get(`${ROOT_LEVEL}`, {
        params: {
            page,
            size
        }
    });

const getById = (id: string) =>
    request.get(`${ROOT_LEVEL}/${id}`);


const createLevel = (name: string, description: string, hierarchyLevel: number) =>
    request.post(`${ROOT_LEVEL}`, {
        name, 
        description,
        hierarchyLevel
    });

const updateLevel = (id: string, name: string, description: string, hierarchyLevel: number) =>
    request.put(`${ROOT_LEVEL}/${id}`, {
        name, 
        description,
        hierarchyLevel
    });
    
const deleteLevel = (id: string): Promise<AxiosResponse<any>> =>
        request.delete(`${ROOT_LEVEL}/${id}`);

const certificatesByLevelId = (id: string) =>
    request.get(`${ROOT_LEVEL}/${id}/certificates`);

const levelApi = {
    getAllLevel,
    getById,
    createLevel,
    updateLevel,
    deleteLevel,
    certificatesByLevelId
};

export default levelApi;