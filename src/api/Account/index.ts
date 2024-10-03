import axiosInstances from "../../config/axios"

const request = axiosInstances.base
// https://localhost:7012/api/v1/

const ROOT_ACCOUNT = "/accounts"

const getAll = (page?: number, size?: number) => 
    request.get(`${ROOT_ACCOUNT}`, {
    params: {
        page,
        size
    }
});

const create = (email: string, password: string, roleId: string) => 
    request.post(`${ROOT_ACCOUNT}`, {
    email, password, roleId
});

const update = (id: string, updatePassword: string) => 
    request.put(`${ROOT_ACCOUNT}/${id}`, {
    password: updatePassword
});

const accountApi = {
    getAll,
    create,
    update
};
  
export default accountApi;