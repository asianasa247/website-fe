import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Giả lập AuthService và SpinnerOverlayService
// Bạn nên thay thế bằng context/hook thực tế của bạn
const authService = {
  get token() {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  },
};
const spinnerOverlayService = {
  show: () => {
    // Hiển thị spinner (tùy bạn implement)
    // Ví dụ: document.body.classList.add('loading')
  },
  hide: () => {
    // Ẩn spinner
    // Ví dụ: document.body.classList.remove('loading')
  },
};

// Hàm chuyển key về camelCase (giống AppUtil.toCamelCaseKey)
function toCamelCaseKey(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCaseKey(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key) => {
      const camelKey = key.replace(/([-_][a-z])/gi, g =>
        g.toUpperCase().replace('-', '').replace('_', ''));
      result[camelKey] = toCamelCaseKey(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach Authorization header
    const token = authService.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach dbName from env variable
    if (process.env.NEXT_PUBLIC_DB_NAME) {
      config.headers = config.headers || {};
      config.headers.dbName = process.env.NEXT_PUBLIC_DB_NAME;
    }
    spinnerOverlayService.show();
    return config;
  },
  (error) => {
    spinnerOverlayService.hide();
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    spinnerOverlayService.hide();
    // Chuyển key về camelCase
    if (response.data) {
      response.data = toCamelCaseKey(response.data);
    }
    return response;
  },
  (error) => {
    spinnerOverlayService.hide();
    return Promise.reject(error);
  },
);

export default api;
