import { AxiosResponse } from "axios";
import axiosInstances from "../../config/axios"
import { BasicResponse } from "../../model/Response/BasicResponse";
import { CertificateResponse } from "../../model/Response/Certificate";
const request = axiosInstances.base


const ROOT_CERTIFICATE = "/certificates"

const createCertificates = async (data: FormData) => {
    return await request.post<BasicResponse<CertificateResponse>>(`${ROOT_CERTIFICATE}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  };

const deleteCertificates = (id: string): Promise<AxiosResponse<any>> =>
    request.delete(`${ROOT_CERTIFICATE}/${id}`);

const certificatesApi = {
    createCertificates,
    deleteCertificates
};

export default certificatesApi;

