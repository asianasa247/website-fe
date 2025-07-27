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
    <div>
      {/* Background video or image */}
      <div className="hidden sm:block rounded-xl"></div>

      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg space-y-4 bg-white p-6 rounded-xl shadow"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Đăng ký tài khoản
          </h2>

          {/* Nút đăng ký qua mạng xã hội */}
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
            <div className="rounded bg-red-100 p-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block font-medium">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Họ và tên */}
          <div>
            <label htmlFor="name" className="block font-medium">
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label htmlFor="password" className="block font-medium">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label htmlFor="confirmPassword" className="block font-medium">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Điều khoản */}
          <p className="text-sm text-gray-600">
            Bằng việc nhấn nút đăng ký, bạn đã đồng ý với
            {' '}
            <span className="text-blue-600 underline">
              Điều khoản sử dụng
            </span>
            {' '}
            và
            {' '}
            <span className="text-blue-600 underline">
              Chính sách bảo mật
            </span>
            {' '}
            của
            {' '}
            <strong className="text-blue-600">JWKJOB</strong>
            .
          </p>

          {/* Nút submit */}
          <button
            type="submit"
            disabled={!password || !confirmPassword || password !== confirmPassword}
            className="w-full rounded bg-green-600 px-4 py-3 text-white text-xl hover:bg-green-700 disabled:opacity-50"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}
