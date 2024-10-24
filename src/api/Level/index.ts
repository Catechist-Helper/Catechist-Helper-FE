import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base
// https://localhost:7012/api/v1/

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


const createLevel = (name: string, description: string, catechismLevel: number) =>
    request.post(`${ROOT_LEVEL}`, {
        name, 
        description,
        catechismLevel
    });

const updateLevel = (id: string, name: string, description: string, catechismLevel: number) =>
    request.put(`${ROOT_LEVEL}/${id}`, {
        name, 
        description,
        catechismLevel
    });
    
const deleteLevel = (id: string): Promise<AxiosResponse<any>> =>
        request.delete(`${ROOT_LEVEL}/${id}`);

const levelApi = {
    getAllLevel,
    getById,
    createLevel,
    updateLevel,
    deleteLevel
};

export default levelApi;