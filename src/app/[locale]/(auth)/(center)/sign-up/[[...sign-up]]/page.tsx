// components/Register.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không trùng khớp');
      return;
    }

    try {
      await authService.registUser({
        phone,
        name,
        password,
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.message || 'Đăng ký thất bại',
      );
    }
  };

  return (
    <div className="  ">
      <div className="hidden sm:block  rounded-xl">
        {/* Background video or image */}
      </div>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h2>

          <div className="flex gap-4">
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <i className="pi pi-facebook"></i>
              {' '}
              Facebook
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              {' '}
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

          <div>
            <label className="block font-medium">Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <p className="text-sm text-gray-600">
            Bằng việc nhấn nút đăng ký, bạn đã đồng ý với
            <a href="#" className="text-blue-600"> Điều khoản sử dụng</a>
            {' '}
            và
            <a href="#" className="text-blue-600"> Chính sách bảo mật</a>
            {' '}
            của
            <strong className="text-blue-600">JWKJOB</strong>
          </p>

          <button
            type="submit"
            disabled={
              !password
              || !confirmPassword
              || password !== confirmPassword
            }
            className="w-full rounded bg-green-600 px-4 py-3 text-white text-xl hover:bg-green-700"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}
