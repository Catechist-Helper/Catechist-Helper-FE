import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base
// https://localhost:7012/api/v1/

const ROOT_TRAININGLIST = "/training-lists"

const getAllTrain = (page?: number, size?: number) =>
    request.get(`${ROOT_TRAININGLIST}`, {
        params: {
            page,
            size
        }
    });

const getById = (id: string) =>
    request.get(`${ROOT_TRAININGLIST}/${id}`);


const createTrain = (previousLevel: string, nextLevel: string, startTime: string, endTime: string, trainingListStatus: number) =>
    request.post(`${ROOT_TRAININGLIST}`, {
        previousLevel,
        nextLevel,
        startTime,
        endTime,
        trainingListStatus
    });

const updateTrain = (id: string, previousLevel: string, nextLevel: string, startTime: string, endTime: string, trainingListStatus: number) =>
    request.put(`${ROOT_TRAININGLIST}/${id}`, {
        previousLevel,
        nextLevel,
        startTime,
        endTime,
        trainingListStatus
    });

const deleteTrain = (id: string): Promise<AxiosResponse<any>> =>
    request.delete(`${ROOT_TRAININGLIST}/${id}`);



const trainApi = {
    getAllTrain,
    getById,
    createTrain,
    updateTrain,
    deleteTrain
};

export default trainApi;