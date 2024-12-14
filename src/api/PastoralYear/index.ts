import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base

const ROOT_PASTORALYEARS = "/pastoral-years"

const getAllPastoralYears = (page?: number, size?: number) =>
    request.get(`${ROOT_PASTORALYEARS}`, {
        params: {
            page,
            size
        }
    });

const getById = (id: string) =>
    request.get(`${ROOT_PASTORALYEARS}/${id}`);


const createPastoralYears = (name: string, note: string, pastoralYearStatus: number) =>
    request.post(`${ROOT_PASTORALYEARS}`, {
        name, 
        note,
        pastoralYearStatus
    });

const updatePastoralYears = (id: string, name: string, note: string, pastoralYearStatus: number) =>
    request.put(`${ROOT_PASTORALYEARS}/${id}`, {
        name, 
        note,
        pastoralYearStatus
    });
    
const deletePastoralYears = (id: string): Promise<AxiosResponse<any>> =>
        request.delete(`${ROOT_PASTORALYEARS}/${id}`);

const pastoralYearsApi = {
    getAllPastoralYears,
    getById,
    createPastoralYears,
    updatePastoralYears,
    deletePastoralYears
};

export default pastoralYearsApi;