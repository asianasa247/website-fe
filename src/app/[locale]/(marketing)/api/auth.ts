import api from './api';

// ===== Types gọn, không phá chỗ khác =====
export type LoginResponse = {
  id: number | string;
  username: string;
  fullname: string;
  avatar?: string | null;
  token: string;
  email?: string | null;
  phone?: string | null;
};

export type ObjectReturn<T> = { status: number; data: T };

export type RegisterResult = {
  id: number | string;
  code: string;
  name: string;
  avatar?: string | null;
  phone: string;
  token?: string;
};

// Khớp BE: WebCustomerV2Model (đăng ký / update-email)
export type WebCustomerV2Model = {
  Id?: number;
  Phone: string;
  Password: string;
  Name: string;
  Email?: string;
  Address?: string;
  ProvinceId?: number | null;
  DistrictId?: number | null;
  WardId?: number | null;
  Gender?: number | null;
  Birthday?: string | null; // ISO 8601
  Avatar?: string | null;
  [key: string]: unknown;
};

// Khớp BE: WebCustomerUpdateModel (update info)
export type WebCustomerUpdateModel = {
  Id: number;
  Name?: string | null;
  Email?: string | null;
  Phone?: string | null;
  Avatar?: string | null;
  Address?: string | null;
  ProvinceId?: number | null;
  DistrictId?: number | null;
  WardId?: number | null;
  Gender?: number | null;
  Birthday?: string | null; // ISO
  [key: string]: unknown;
};

export type CompanyInfo = Record<string, unknown>;

// ===== Helpers =====
function saveToken(token?: string | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token && token.length > 0) {
    localStorage.setItem('Token', token);
  }
}

function readTokenFromResponse(data: unknown): string | null {
  // System.Text.Json serialize mặc định camelCase → cả token/Token đều có thể xuất hiện
  const d = data as any;
  return d?.token ?? d?.Token ?? null;
}

// ===== AUTH APIs (GIỮ NGUYÊN TÊN HÀM VÀ DEFAULT EXPORT) =====

// POST /api/WebAuth/login  — body JSON { Username, Password }
async function login(phone: string, password: string): Promise<LoginResponse> {
  const payload = { Username: phone, Password: password };
  const { data } = await api.post<LoginResponse>(
    '/WebAuth/login',
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  saveToken(readTokenFromResponse(data));
  return data;
}

// POST /api/WebAuth/register — body JSON PascalCase (WebCustomerV2Model)
async function register(form: Omit<WebCustomerV2Model, 'Id'>): Promise<ObjectReturn<RegisterResult>> {
  const { data } = await api.post<ObjectReturn<RegisterResult>>(
    '/WebAuth/register',
    form,
    { headers: { 'Content-Type': 'application/json' } },
  );
  // BE trả về ObjectReturn { status, data: { ..., Token } }
  // Nếu có Token, lưu để đăng nhập ngay sau khi đăng ký
  const token

    = ((data as any)?.data?.Token as string | undefined)
      ?? readTokenFromResponse(data);
  if (token) {
    saveToken(token);
  }
  return data;
}

// POST /api/WebAuth/login-social — body JSON { Provider, Token }
async function loginSocial(provider: 'FACEBOOK' | 'GOOGLE', providerToken: string) {
  const payload = { Provider: provider, Token: providerToken };
  const { data } = await api.post(
    '/WebAuth/login-social',
    payload,
    { headers: { 'Content-Type': 'application/json' } },
  );
  saveToken(readTokenFromResponse(data));
  return data;
}

// POST /api/WebAuth/update-email — body JSON { Id, Email }
async function updateEmail(model: Pick<WebCustomerV2Model, 'Id' | 'Email'>) {
  const { data } = await api.post(
    '/WebAuth/update-email',
    model,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data;
}

// GET /api/WebAuth/info/{id} — cần Bearer token
async function getInfo(id: number | string) {
  const { data } = await api.get(`/WebAuth/info/${id}`);
  return data;
}

// POST /api/WebAuth/info — body JSON WebCustomerUpdateModel
async function updateInfo(model: WebCustomerUpdateModel) {
  const { data } = await api.post(
    '/WebAuth/info',
    model,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data;
}

// POST /api/WebAuth/change-pass-word/{id}?password=...  (BE lấy param password từ query)
async function changePassword(id: number | string, password: string) {
  const { data } = await api.post(`/WebAuth/change-pass-word/${id}?password=${encodeURIComponent(password)}`);
  return data;
}

// (Giữ để không vỡ Header/Footer; nếu hệ thống không có, hàm này có thể không được gọi)
async function getCompany(): Promise<CompanyInfo> {
  const candidates = [
    '/WebDashboard/getCompany',
    '/WebCompany/getCompany',
    '/WebCompany/get',
    '/WebConfig/getCompany',
    '/WebAuth/getCompany',
    '/WebAuth/company',
  ];
  let lastErr: unknown = null;

  for (const path of candidates) {
    try {
      const { data } = await api.get(path);
      return data as CompanyInfo;
    } catch (err) {
      const st = (err as any)?.response?.status as number | undefined;
      if (st && st !== 404) {
        throw err;
      }
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('No company endpoint found');
}

function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('Token');
  }
}

// ===== Default export GIỮ TÊN =====
const authService = {
  login,
  register,
  loginSocial,
  updateEmail,
  getInfo,
  updateInfo,
  changePassword,
  getCompany,
  logout,
};

export default authService;
