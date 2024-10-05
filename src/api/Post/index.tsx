import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"

const request = axiosInstances.base


const ROOT_POSTS= "/posts"

const getAll = (page?: number, size?: number) =>
    request.get(`${ROOT_POSTS}`, {
        params: {
            page,
            size
        }
    });

    const getById = (id: string) =>
        request.get(`${ROOT_POSTS}/${id}`);
    
    
    const create = (title: string, content: string, module: string, accountId: string, 
        postCategoryId: string) : Promise<AxiosResponse<any>>=>
        request.post(`${ROOT_POSTS}`, {
            title, 
            content,
            module,
            accountId,
            postCategoryId
        });
    
    const update = (id: string, title: string, content: string, module: string, accountId: string, postCategoryId: string) =>
        request.put(`${ROOT_POSTS}/${id}`, {
            title, 
            content,
            module,
            accountId,
            postCategoryId
        });
        
    const deletePosts = (id: string): Promise<AxiosResponse<any>> =>
            request.delete(`${ROOT_POSTS}/${id}`);

    const postsApi = {
        getAll,
        getById,
        create,
        update,
        deletePosts
    };
    
    export default postsApi;

