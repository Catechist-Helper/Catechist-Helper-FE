import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base
// https://localhost:7012/api/v1/

const ROOT_POSTCATEGORY = "/post-categories"

const getAll = (page?: number, size?: number) =>
    request.get(`${ROOT_POSTCATEGORY}`, {
        params: {
            page,
            size
        }
    });

const getById = (id: string) =>
    request.get(`${ROOT_POSTCATEGORY}/${id}`);


const create = (name: string, description: string) =>
    request.post(`${ROOT_POSTCATEGORY}`, {
        name, description
    });

const update = (id: string, name: string, description: string) =>
    request.put(`${ROOT_POSTCATEGORY}/${id}`, {
        name,
        description
    });
    
const deleteCategory = (id: string): Promise<AxiosResponse<any>> =>
        request.delete(`${ROOT_POSTCATEGORY}/${id}`);

const postCategoryApi = {
    getAll,
    getById,
    create,
    update,
    deleteCategory
};

export default postCategoryApi;