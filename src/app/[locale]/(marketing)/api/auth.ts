import { BehaviorSubject } from 'rxjs';
import api from './api';

const STORAGE_KEYS = {
  USER: 'currentUser',
  SESSION: 'session',
  INFO: 'info',
};

class AuthService {
  _userInfo = new BehaviorSubject<any | null>(null);
  initialAuthenticated = new BehaviorSubject('Initial Authenticated');

  constructor() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      this.userInfo = user ? JSON.parse(user) : null;
    }
  }

  get userInfo() {
    return this._userInfo.value;
  }

  set userInfo(value: any | null) {
    this._userInfo.next(value);
  }

  get user() {
    if (typeof window === 'undefined') {
      return null;
    }
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  get token() {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.SESSION);
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SESSION, token);
    }
  }

  deleteToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.INFO);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  clearSession() {
    this.deleteToken();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }

  setUser(authUser: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
    }
  }

  deleteUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  async login(params: any) {
    const res = await api.post('/auth/login-web', params);
    return res.data;
  }

  async getAuthInfo(userId: string) {
    const res = await api.get(`/auth/info/${userId}`);
    return res.data;
  }

  async registUser(params: any) {
    const res = await api.post('/auth/register-user-web', params);
    return res.data;
  }

  async changePassword(params: any) {
    const res = await api.post('/auth/change-password', params);
    return res.data;
  }

  async registEmployer(params: any) {
    const res = await api.post('/auth/register-employer-web', params);
    return res.data;
  }

  async resetPassword(params: any) {
    const res = await api.post('/auth/requestForgotPass', params);
    return res.data;
  }

  async uploadAvatar(params: any, userId: string) {
    const res = await api.post(`/auth/${userId}/upload-avatar`, params);
    return res.data;
  }

  initAuthenticated() {
    this.initialAuthenticated.next('initial authenticated');
  }

  async getCompany() {
    const res = await api.get('/Companies/get-company');
    // Nếu muốn cập nhật vào một observable khác, bạn có thể thêm logic ở đây
    return res.data;
  }

  async loadSocialConfig() {
    try {
      const res = await api.get('/Companies/get-company');
      // Cập nhật vào biến toàn cục nếu cần
      // AppConstant.SOCIAL.Facebook_Id = res.data.facebookAppId;
      // AppConstant.SOCIAL.Google_Id = res.data.googleAppId;
      return res.data;
    } catch (error) {
      console.warn('Failed to load social config from backend', error);
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;
