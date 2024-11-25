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


const createTrain = (name: string, description: string, certificateId: string, previousLevelId: string, nextLevelId: string, startTime: string, endTime: string) =>
    request.post(`${ROOT_TRAININGLIST}`, {
        name,
        description,
        certificateId,
        previousLevelId,
        nextLevelId,
        startTime,
        endTime,

    });

const updateTrain = (id: string, name: string, description: string, certificateId: string, previousLevelId: string, nextLevelId: string, startTime: string, endTime: string, trainingListStatus:number) =>
    request.put(`${ROOT_TRAININGLIST}/${id}`, {
        name,
        description,
        certificateId,
        previousLevelId,
        nextLevelId,
        startTime,
        endTime,
        trainingListStatus
    });

const deleteTrain = (id: string): Promise<AxiosResponse<any>> =>
    request.delete(`${ROOT_TRAININGLIST}/${id}`);

const getCatechistsByTrainingListId = (id: string) =>
    request.get(`${ROOT_TRAININGLIST}/${id}/catechists`);

const trainApi = {
    getAllTrain,
    getById,
    createTrain,
    updateTrain,
    deleteTrain,
    getCatechistsByTrainingListId
};

export default trainApi;