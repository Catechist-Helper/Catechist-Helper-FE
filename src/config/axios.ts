import axios from "axios";

export enum AxiosClientFactoryEnum {
  BASE = "/",
}

export const parseParams = (params: any) => {
  const keys = Object.keys(params);
  let options = "";

  keys.forEach((key) => {
    const isParamTypeObject = typeof params[key] === "object";
    const isParamTypeArray =
      isParamTypeObject &&
      Array.isArray(params[key]) &&
      params[key].length >= 0;

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

// const baseURL = `https://catechist-helper-api-v2.azurewebsites.net/api/v1/`;
const baseURL = `https://localhost:7012/api/v1/`;

const request = axios.create({
  baseURL: baseURL,
});

request.interceptors.request.use((options) => {
  const { method } = options;

  // Với phương thức PUT và POST, kiểm tra headers để quyết định định dạng request
  if (method === "put" || method === "post") {
    if (!options.headers["Content-Type"]) {
      Object.assign(options.headers, {
        "Content-Type": "application/json;charset=UTF-8", // Mặc định là JSON
      });
    }
  }

  return options;
});

request.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject((error.response && error.response.data) || "Có lỗi xảy ra")
);

class AxiosClientFactory {
  getAxiosClient(type?: AxiosClientFactoryEnum) {
    switch (type) {
      case "/":
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
