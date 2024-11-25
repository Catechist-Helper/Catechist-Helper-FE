import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"
const request = axiosInstances.base


const ROOT_CERTIFICATEOFCATECHIST = "/certificate-of-catechists"

const createCertificateOfCate = (catechistId: string, certificateId: string, grantedDate: string): Promise<AxiosResponse<any>> =>
    request.post(`${ROOT_CERTIFICATEOFCATECHIST}`, {
        catechistId,
        certificateId,
        grantedDate

    });

const certificateOfCateApi = {
    createCertificateOfCate,
};

export default certificateOfCateApi;

