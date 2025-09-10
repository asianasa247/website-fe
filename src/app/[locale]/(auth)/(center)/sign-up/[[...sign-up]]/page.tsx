/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';

// Kiểu dữ liệu gửi lên BE theo /api/WebAuth/register
// id, name, avatar, birthday, gender, phone, provinceId, districtId, wardId, email, address, password
type RegisterPayload = {
  id: number;
  name: string;
  avatar?: string;
  birthday?: string; // ISO
  gender: number;
  phone: string;
  provinceId?: number;
  districtId?: number;
  wardId?: number;
  email: string;
  address: string;
  password: string;
};

type RegisterOkRaw = {
  status?: number;
  data?: {
    Id?: number;
    Code?: string;
    Name?: string;
    Avatar?: string | null;
    Phone?: string;
    Token?: string;
  };
};

type RegisteredUser = {
  id: number;
  code: string;
  name: string;
  avatar: string | null;
  phone: string;
  token: string;
};

type Province = { id: number; name: string };
type District = { id: number; name: string };

export default function Register() {
  const router = useRouter();

  // Required fields
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional / extra fields khớp Swagger
  const [avatar, setAvatar] = useState('');
  const [birthday, setBirthday] = useState(''); // yyyy-mm-dd
  const [gender, setGender] = useState(0);
  const [provinceId, setProvinceId] = useState(0);
  const [districtId, setDistrictId] = useState(0);
  // const [wardId, setWardId] = useState(0);
  const [address, setAddress] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Dữ liệu địa giới hành chính
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);

  const normalizeRegisterResponse = (raw: RegisterOkRaw | unknown): RegisteredUser => {
    const rr = raw as RegisterOkRaw;
    const payload = rr?.data ?? (raw as Record<string, unknown>);
    return {
      id: Number((payload as Record<string, unknown>)?.Id ?? 0),
      code: String((payload as Record<string, unknown>)?.Code ?? ''),
      name: String((payload as Record<string, unknown>)?.Name ?? ''),
      avatar: (((payload as Record<string, unknown>)?.Avatar as string | undefined) ?? null) as string | null,
      phone: String((payload as Record<string, unknown>)?.Phone ?? ''),
      token: String((payload as Record<string, unknown>)?.Token ?? ''),
    };
  };

  // Fetch provinces on mount (GET /api/WebAddress/getProvince)
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const fetchProvinces = async () => {
      try {
        setLoadingProvince(true);
        const res = await fetch(`${base}/api/WebAddress/getProvince`, { method: 'GET' });
        if (!res.ok) {
          throw new Error(`getProvince ${res.status}`);
        }
        const json = await res.json();
        const arr = (json?.data ?? json ?? []) as any[];
        const mapped = arr
          .map(x => ({
            id: Number(x.id ?? x.Id ?? x.code ?? x.Code ?? 0),
            name: String(x.name ?? x.Name ?? x.title ?? x.Title ?? ''),
          }))
          .filter(i => i.id && i.name) as Province[];
        setProvinces(mapped);
      } catch {
        setProvinces([]);
      } finally {
        setLoadingProvince(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes (GET /api/WebAddress/getDistrict/{id})
  useEffect(() => {
    if (!provinceId) {
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const fetchDistricts = async () => {
      try {
        setLoadingDistrict(true);
        const res = await fetch(`${base}/api/WebAddress/getDistrict/${provinceId}`, { method: 'GET' });
        if (!res.ok) {
          throw new Error(`getDistrict ${res.status}`);
        }
        const json = await res.json();
        const arr = (json?.data ?? json ?? []) as any[];
        const mapped = arr
          .map(x => ({
            id: Number(x.id ?? x.Id ?? x.code ?? x.Code ?? 0),
            name: String(x.name ?? x.Name ?? x.title ?? x.Title ?? ''),
          }))
          .filter(i => i.id && i.name) as District[];
        setDistricts(mapped);
      } catch {
        setDistricts([]);
      } finally {
        setLoadingDistrict(false);
      }
    };
    fetchDistricts();
  }, [provinceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không trùng khớp');
      return;
    }

    const payload: RegisterPayload = {
      id: 0,
      name,
      avatar: avatar || undefined,
      birthday: birthday ? new Date(birthday).toISOString() : undefined,
      gender: Number(gender),
      phone,
      provinceId: Number(provinceId) || 0,
      districtId: Number(districtId) || 0,
      // wardId: Number(wardId) || 0,
      email,
      address,
      password,
    };

    try {
      setLoading(true);
      const raw = await authService.register(payload);
      const ok = normalizeRegisterResponse(raw);

      (authService as unknown as { setToken?: (t: string) => void }).setToken?.(ok.token);
      const userObj = {
        id: ok.id,
        code: ok.code,
        name: ok.name,
        avatar: ok.avatar,
        phone: ok.phone,
        email,
      };
      (authService as unknown as { setUser?: (u: unknown) => void }).setUser?.(userObj);
      (authService as unknown as { userInfo?: unknown }).userInfo = userObj;
      (authService as unknown as { initAuthenticated?: () => void }).initAuthenticated?.();

      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setErrorMessage(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white py-4">
      <div className="flex items-start justify-center px-3">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-5xl space-y-3 rounded-2xl bg-white p-5 shadow-xl border border-gray-100"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Tạo tài khoản mới</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 shadow-sm"
                onClick={() => setErrorMessage('Đăng ký qua MXH: dùng trang Đăng nhập → Facebook/Google')}
                title="Đăng ký với Facebook"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Facebook_logo_36x36.svg/1024px-Facebook_logo_36x36.svg.png"
                  alt="Facebook"
                  className="w-5 h-5"
                />
                <span className="font-medium">Facebook</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 shadow-sm"
                onClick={() => setErrorMessage('Đăng ký qua MXH: dùng trang Đăng nhập → Facebook/Google')}
                title="Đăng ký với Gmail"
              >
                <img
                  src="https://images.icon-icons.com/2642/PNG/512/google_mail_gmail_logo_icon_159346.png"
                  alt="Gmail"
                  className="w-5 h-5"
                />
                <span className="font-medium">Gmail</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <hr className="border-gray-200" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[11px] text-gray-500">
              Hoặc đăng ký bằng email của bạn
            </span>
          </div>

          {errorMessage && <div className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 border border-red-200">{errorMessage}</div>}

          {/* Grid 3 cột để rút ngắn chiều dọc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label htmlFor="name" className="mb-1 block font-medium text-gray-700">Họ và tên</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block font-medium text-gray-700">Số điện thoại</label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                required
              />
            </div>

            <div>
              <label htmlFor="avatar" className="mb-1 block font-medium text-gray-700">Avatar (URL / mã)</label>
              <input
                id="avatar"
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                placeholder="vd: https://..."
              />
            </div>
            <div>
              <label htmlFor="birthday" className="mb-1 block font-medium text-gray-700">Ngày sinh</label>
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label htmlFor="gender" className="mb-1 block font-medium text-gray-700">Giới tính</label>
              <select
                id="gender"
                value={gender}
                onChange={e => setGender(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value={0}>Khác/Không xác định (0)</option>
                <option value={1}>Nam (1)</option>
                <option value={2}>Nữ (2)</option>
              </select>
            </div>

            <div>
              <label htmlFor="provinceId" className="mb-1 block font-medium text-gray-700">Tỉnh/Thành Phố</label>
              <select
                id="provinceId"
                value={provinceId}
                onChange={(e) => {
                  const pid = Number(e.target.value);
                  setProvinceId(pid);
                  setDistrictId(0);
                  setDistricts([]);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value={0} disabled={loadingProvince}>
                  {loadingProvince ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}
                </option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="districtId" className="mb-1 block font-medium text-gray-700">Quận/Huyện</label>
              <select
                id="districtId"
                value={districtId}
                onChange={e => setDistrictId(Number(e.target.value))}
                disabled={!provinceId || loadingDistrict}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value={0} disabled>
                  {!provinceId ? 'Chọn Tỉnh/Thành trước' : (loadingDistrict ? 'Đang tải...' : '-- Chọn Quận/Huyện --')}
                </option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Địa chỉ cùng hàng với 2 dropdown */}
            <div>
              <label htmlFor="address" className="mb-1 block font-medium text-gray-700">Địa chỉ</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            {/* Mật khẩu & Xác nhận mật khẩu cùng hàng */}
            <div>
              <label htmlFor="password" className="mb-1 block font-medium text-gray-700">Mật khẩu</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block font-medium text-gray-700">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                required
              />
            </div>
          </div>

          <p className="text-xs text-gray-600">
            {'Bằng việc nhấn nút đăng ký, bạn đã đồng ý với '}
            <span className="text-blue-600 underline">Điều khoản sử dụng</span>
            {' và '}
            <span className="text-blue-600 underline">Chính sách bảo mật</span>
            {' của '}
            <strong className="text-blue-600">JWKJOB</strong>
            .
          </p>

          <button
            type="submit"
            disabled={
              loading || !phone || !name || !email || !password || !confirmPassword || password !== confirmPassword
            }
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-base text-white hover:bg-green-700 disabled:opacity-50 shadow-md"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}
