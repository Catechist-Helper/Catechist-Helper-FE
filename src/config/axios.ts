import axios, { AxiosRequestConfig } from 'axios';

export enum AxiosClientFactoryEnum {
  AUTH = 'auth',
  SHOP = 'shop',
  WAREHOUSE = 'warehouse',
}

export const parseParams = (params: any) => {
  const keys = Object.keys(params);
  let options = '';

  keys.forEach((key) => {
    const isParamTypeObject = typeof params[key] === 'object';
    const isParamTypeArray =
      isParamTypeObject && Array.isArray(params[key]) && params[key].length >= 0;

    if (!isParamTypeObject) {
      options += `${key}=${params[key]}&`;
    }

    if (isParamTypeObject && isParamTypeArray) {
      params[key].forEach((element: any) => {
        options += `${key}=${element}&`;
      });
    }
  });

  return options ? options.slice(0, -1) : options;
};

const auth = `https://loco.com.co/authcontainer/api/`;
const shop = `https://loco.com.co/shopcontainer/api/`;
const warehouse = `https://loco.com.co/managementcontainer/api/`;

const request = axios.create({
  baseURL: auth,
  paramsSerializer: parseParams
});

request.interceptors.request.use((options) => {
  const { method } = options;

  if (method === 'put' || method === 'post') {
    Object.assign(options.headers, {
      'Content-Type': 'application/json;charset=UTF-8'
    });
  }

  return options;
});

request.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Có lỗi xảy ra')
);

const requestManagement = axios.create({
  baseURL: shop,
  paramsSerializer: parseParams,
  headers: {
    Authorization:
      'Bearer '
  }
});

requestManagement.interceptors.request.use((options) => {
  const { method } = options;

  if (method === 'put' || method === 'post') {
    Object.assign(options.headers, {
      'Content-Type': 'application/json;charset=UTF-8'
    });
  }

  return options;
});

requestManagement.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Có lỗi xảy ra')
);

const requestWarehouse = axios.create({
    baseURL: warehouse,
    paramsSerializer: parseParams,
    headers: {
        Authorization:
          'Bearer '
      }
});
  
  
requestWarehouse.interceptors.request.use((options) => {
    const { method } = options;

  if (method === 'put' || method === 'post') {
    Object.assign(options.headers, {
      'Content-Type': 'application/json;charset=UTF-8'
    });
  }

  return options;
  });
  
requestWarehouse.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Có lỗi xảy ra')
  );

class AxiosClientFactory {
  getAxiosClient(type?: AxiosClientFactoryEnum, config: AxiosRequestConfig = {}) {
    switch (type) {
      case 'auth':
        return request;
      case 'shop':
        return requestManagement;
      case 'warehouse':
        return requestWarehouse;
      default:
        return request;
    }
  }
}

const axiosClientFactory = new AxiosClientFactory();

const axiosInstances = {
  auth: axiosClientFactory.getAxiosClient(AxiosClientFactoryEnum.AUTH),
  shop: axiosClientFactory.getAxiosClient(AxiosClientFactoryEnum.SHOP),
  warehouse: axiosClientFactory.getAxiosClient(AxiosClientFactoryEnum.WAREHOUSE),
};

export { axiosClientFactory };

export default axiosInstances;
