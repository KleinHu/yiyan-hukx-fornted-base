import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';

export interface HttpResponse<T = unknown> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

const request = axios.create({
  baseURL: '',
});

// 已经报警过就不要再弹窗做登出提示了
let hasWarned = false;

// if (import.meta.env.VITE_API_BASE_URL) {
//   request.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
//   // axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
// }

request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
request.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response.data;
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200) {
      // 50008: Illegal token;
      // 50012: Other clients logged in;
      // 50014: Token expired;
      // 401: 鉴权失败
      if (
        [50008, 50012, 50014, 401].includes(res.code) &&
        response.config.url !== '/api/user/info'
      ) {
        if (!hasWarned) {
          hasWarned = true;
          Modal.error({
            title: '登出确认',
            content: '登录过期或你已退出，请重新登录。',
            okText: '重新登录',
            async onOk() {
              const userStore = useUserStore();

              await userStore.logout();
              window.location.reload();
            },
            async onClose() {
              hasWarned = false;
            },
          });
        }
      } else {
        Message.error({
          content: res.message || 'Error',
          duration: 5 * 1000,
        });
      }
      return Promise.reject(new Error(res.message || 'Error'));
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
