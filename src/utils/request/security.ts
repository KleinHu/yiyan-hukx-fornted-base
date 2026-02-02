import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from '@arco-design/web-vue';

export interface SuccessResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export interface FailResponse<T = unknown> {
  message?: string;
  code?: number;
  data?: T;
  error?: string;
  error_description?: string;
}

const request = axios.create({
  baseURL: '',
});

// if (import.meta.env.VITE_API_BASE_URL) {
//   request.defaults.baseURL = `/api`;
//   // axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
// }

request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);

// add response interceptors
request.interceptors.response.use(
  (response: AxiosResponse<SuccessResponse | FailResponse>) => {
    const res = response.data;
    // res返回为FailResponse类型.
    if (Object.prototype.hasOwnProperty.call(res, 'error')) {
      Message.error({
        content: (res as FailResponse).error_description || 'Error',
        duration: 5 * 1000,
      });
      return Promise.reject(
        new Error((res as FailResponse).error_description || 'Error')
      );
    }
    if (
      Object.prototype.hasOwnProperty.call(res, 'code') &&
      (res as FailResponse).code !== 200 &&
      response.config.url !== '/api/oauth/logout'
    ) {
      // token过期登出时logout返回错误信息，也认为结果正确
      Message.error({
        content: (res as FailResponse).message || 'Error',
        duration: 5 * 1000,
      });
      return Promise.reject(
        new Error((res as FailResponse).message || 'Error')
      );
    }
    return res;
  },
  (error) => {
    Message.error({
      content: error.msg || 'Request Error',
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);

export default request;
