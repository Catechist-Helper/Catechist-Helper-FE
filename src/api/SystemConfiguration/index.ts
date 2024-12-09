import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base

const ROOT_SYSTEMCONFIG = "/system-configurations"

const getAllConfig = (page?: number, size?: number) =>
    request.get(`${ROOT_SYSTEMCONFIG}`, {
        params: {
            page,
            size
        }
    });

const getById = (id: string) =>
    request.get(`${ROOT_SYSTEMCONFIG}/${id}`);


const createConfig = (key: string, value: string) =>
    request.post(`${ROOT_SYSTEMCONFIG}`, {
        key, 
        value
    });

const updateConfig = (id: string, key: string, value: string) =>
    request.put(`${ROOT_SYSTEMCONFIG}/${id}`, {
        key, 
        value
    });
    
const deleteConfig = (id: string): Promise<AxiosResponse<any>> =>
        request.delete(`${ROOT_SYSTEMCONFIG}/${id}`);

const systemConfigApi = {
    getAllConfig,
    getById,
    createConfig,
    updateConfig,
    deleteConfig
};

export default systemConfigApi;