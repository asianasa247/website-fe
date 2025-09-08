import axios from 'axios';

const root
  = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') as string)
    || 'https://bh.asianasa.com:8443';
const api = axios.create({
  baseURL: `${root}/api`,
  // KHÔNG set Content-Type mặc định
});

// đọc token lưu sau khi đăng nhập
function readToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const keys = ['Token', 'token', 'access_token', 'jwt'];
  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (v) {
      return v.replace(/^Bearer\s+/i, '');
    }
  }
  return null;
}

// gắn Authorization cho mọi request (nếu có token)
api.interceptors.request.use((config) => {
  const token = readToken();
  const dbName = process.env.NEXT_PUBLIC_DB_NAME ;

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    (config.headers as Record<string, string>).dbName = `${dbName}`;
  }
  return config;
});

export default api;

// Giả lập AuthService và SpinnerOverlayService
// Bạn nên thay thế bằng context/hook thực tế của bạn
// const authService = {
//   get token() {
//     return typeof window !== 'undefined' ? localStorage.getItem('token') : '';
//   },
// };
// const spinnerOverlayService = {
//   show: () => {
//     // Hiển thị spinner (tùy bạn implement)
//     // Ví dụ: document.body.classList.add('loading')
//   },
//   hide: () => {
//     // Ẩn spinner
//     // Ví dụ: document.body.classList.remove('loading')
//   },
// };

// // Hàm chuyển key về camelCase (giống AppUtil.toCamelCaseKey)
// function toCamelCaseKey(obj: any): any {
//   if (Array.isArray(obj)) {
//     return obj.map(v => toCamelCaseKey(v));
//   } else if (obj !== null && obj.constructor === Object) {
//     return Object.keys(obj).reduce((result: any, key) => {
//       const camelKey = key.replace(/([-_][a-z])/gi, g =>
//         g.toUpperCase().replace('-', '').replace('_', ''));
//       result[camelKey] = toCamelCaseKey(obj[key]);
//       return result;
//     }, {});
//   }
//   return obj;
// }

// const api = axios.create({
//   baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // Attach Authorization header
//     const token = authService.token;
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     // Attach dbName from env variable
//     if (process.env.NEXT_PUBLIC_DB_NAME) {
//       config.headers = config.headers || {};
//       config.headers.dbName = process.env.NEXT_PUBLIC_DB_NAME;
//     }
//     spinnerOverlayService.show();
//     return config;
//   },
//   (error) => {
//     spinnerOverlayService.hide();
//     return Promise.reject(error);
//   },
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response: AxiosResponse) => {
//     spinnerOverlayService.hide();
//     // Chuyển key về camelCase
//     if (response.data) {
//       response.data = toCamelCaseKey(response.data);
//     }
//     return response;
//   },
//   (error) => {
//     spinnerOverlayService.hide();
//     return Promise.reject(error);
//   },
// );

// export default api;
