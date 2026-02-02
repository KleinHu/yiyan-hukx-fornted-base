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
  result?: T;
}

const request = axios.create({
  baseURL: '',
});

// 已经报警过就不要再弹窗做登出提示了
let hasWarned = false;

request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    if (!config.headers) {
      config.headers = {};
    }
    // config.headers['Accept-Language'] = 'zh-CN,zh;q=0.9';
    config.headers['Accept-Language'] = 'zh-CN';
    const token = getToken();
    if (token) {
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
    const res = (response as AxiosResponse).data;
    if (!(res.success ?? true)) {
      Message.error(res.message || res.repMsg);
      return Promise.reject(new Error(res.message || res.repMsg || 'Error'));
    }
    return response as AxiosResponse<HttpResponse>;
  },
  (error) => {
    const { response } = error;
    const res = response.data;
    if ([50008, 50012, 50014, 401].includes(res.code)) {
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
        content: res.message || res.repMsg || 'Error',
        duration: 5 * 1000,
      });
    }
    return Promise.reject(error);
  }
);

export default request;
