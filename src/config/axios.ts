import axios, { AxiosRequestConfig } from 'axios';

export enum AxiosClientFactoryEnum {
  BASE = '/',
}

const baseURL = `https://catechist-helper-api-v2.azurewebsites.net/api/v1/`;

const request = axios.create({
  baseURL: baseURL,
});

request.interceptors.request.use((options) => {
  const { method } = options;

  // Với phương thức PUT và POST, kiểm tra headers để quyết định định dạng request
  if (method === 'put' || method === 'post') {
    if (!options.headers['Content-Type']) {
      Object.assign(options.headers, {
        'Content-Type': 'application/json;charset=UTF-8', // Mặc định là JSON
      });
    }
  }

  return options;
});

request.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Có lỗi xảy ra')
);

class AxiosClientFactory {
  getAxiosClient(type?: AxiosClientFactoryEnum, config: AxiosRequestConfig = {}) {
    switch (type) {
      case '/':
        return request;
      default:
        return request;
    }
  }
}

const axiosClientFactory = new AxiosClientFactory();

const axiosInstances = {
  base: axiosClientFactory.getAxiosClient(AxiosClientFactoryEnum.BASE),
};

export { axiosClientFactory };
export default axiosInstances;
