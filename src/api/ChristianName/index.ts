import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base


const ROOT_CHRISTIANNAME = "/christian-names"

const getAllChristianNames = (page?: number, size?: number) =>
    request.get(`${ROOT_CHRISTIANNAME}`, {
        params: {
            page,
            size
        }
    });

const getById = (id: string) =>
    request.get(`${ROOT_CHRISTIANNAME}/${id}`);


const createChristianNames = (name: string, gender: string, holyDay: string): Promise<AxiosResponse<any>> =>
    request.post(`${ROOT_CHRISTIANNAME}`, {
        name,
        gender,
        holyDay

    });

const updateChristianNames = (id: string, name: string, gender: string, holyDay: string): Promise<AxiosResponse<any>> =>
    request.put(`${ROOT_CHRISTIANNAME}/${id}`, {
        name,
        gender,
        holyDay
    });


const deleteChristianNames = (id: string): Promise<AxiosResponse<any>> =>
    request.delete(`${ROOT_CHRISTIANNAME}/${id}`);

const christianNamesApi = {
    getAllChristianNames,
    getById,
    createChristianNames,
    updateChristianNames,
    deleteChristianNames
};

export default christianNamesApi;

