'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';

// Kiểu dữ liệu gửi lên BE theo /api/WebAuth/register
// Tham chiếu hình Swagger: id, name, avatar, birthday, gender, phone,
// provinceId, districtId, wardId, email, address, password

type RegisterPayload = {
  id: number;
  name: string;
  avatar?: string;
  // birthday ISO string (optional)
  birthday?: string;
  gender: number;
  phone: string;
  provinceId: number;
  districtId: number;
  wardId: number;
  email: string;
  address: string;
  password: string;
};

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
  const [birthday, setBirthday] = useState(''); // yyyy-mm-dd từ <input type="date" />
  const [gender, setGender] = useState(0);
  const [provinceId, setProvinceId] = useState(0);
  const [districtId, setDistrictId] = useState(0);
  const [wardId, setWardId] = useState(0);
  const [address, setAddress] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      wardId: Number(wardId) || 0,
      email,
      address,
      password,
    };

    try {
      setLoading(true);
      await authService.register(payload);
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h2>

          {/* Social buttons */}
          <div className="flex gap-4">
            <button type="button" className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <i className="pi pi-facebook" />
              Facebook
            </button>
            <button type="button" className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
              Gmail
            </button>
          </div>

          <div className="relative">
            <hr className="border-gray-300" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              Hoặc tài khoản của bạn
            </span>
          </div>

          {errorMessage && (
            <div className="rounded bg-red-100 p-2 text-sm text-red-700">{errorMessage}</div>
          )}

          {/* Hàng 1: Họ tên + Điện thoại */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block font-medium">Họ và tên</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block font-medium">Số điện thoại</label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
          </div>

          {/* Hàng 2: Email + Avatar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1 block font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label htmlFor="avatar" className="mb-1 block font-medium">Avatar (URL / mã)</label>
              <input
                id="avatar"
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="vd: https://..."
              />
            </div>
          </div>

          {/* Hàng 3: Birthday + Gender */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="birthday" className="mb-1 block font-medium">Ngày sinh</label>
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label htmlFor="gender" className="mb-1 block font-medium">Giới tính</label>
              <select
                id="gender"
                value={gender}
                onChange={e => setGender(Number(e.target.value))}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              >
                <option value={0}>Khác/Không xác định (0)</option>
                <option value={1}>Nam (1)</option>
                <option value={2}>Nữ (2)</option>
              </select>
            </div>
          </div>

          {/* Hàng 4: Địa chỉ */}
          <div>
            <label htmlFor="address" className="mb-1 block font-medium">Địa chỉ</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Hàng 5: KV hành chính */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="provinceId" className="mb-1 block font-medium">provinceId</label>
              <input
                id="provinceId"
                type="number"
                value={provinceId}
                onChange={e => setProvinceId(Number(e.target.value))}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label htmlFor="districtId" className="mb-1 block font-medium">districtId</label>
              <input
                id="districtId"
                type="number"
                value={districtId}
                onChange={e => setDistrictId(Number(e.target.value))}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div>
              <label htmlFor="wardId" className="mb-1 block font-medium">wardId</label>
              <input
                id="wardId"
                type="number"
                value={wardId}
                onChange={e => setWardId(Number(e.target.value))}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1 block font-medium">Mật khẩu</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block font-medium">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
          </div>

          <p className="text-sm text-gray-600">
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
            className="w-full rounded bg-green-600 px-4 py-3 text-xl text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}
