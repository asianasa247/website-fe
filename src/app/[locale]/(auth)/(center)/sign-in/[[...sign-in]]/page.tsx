/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
// components/Login.tsx
'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';

export default function Login() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://default-api-url.com';
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, password, rememberMe }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/');
    } else {
      setErrorMessage(data.message || 'Đăng nhập thất bại');
    }
  };

  const handleLoginSocial = async (provider: 'google' | 'facebook') => {
    await signIn(provider, { callbackUrl: '/' });
  };
  useEffect(() => {
    authService.getCompany().then((company) => {
      if (company) {
        setCompanyInfo(company.data);
        setCompanyLogo(`${url}/${company.data.fileLogo}`);
      } else {
        console.warn('No company data found');
      }
    });
  }, []);
  return (
    <div className="pb-10 pt-12 px-4 flex items-center justify-center ">
      <div className="w-full max-w-4xl rounded-[56px] bg-gradient-to-b from-blue-500/90 to-transparent p-[0.3rem]">
        <div className="rounded-[53px] bg-gradient-to-b from-gray-100 to-white p-6">
          <div className="text-center mb-6">
            {companyLogo && (
              <Image
                src={companyLogo}
                alt="Company Logo"
                width={81}
                height={60}
                className="mx-auto mt-5 rounded-full"
              />
            )}
            <h5 className="text-2xl font-semibold text-blue-600 mb-2">
              {companyInfo?.name || 'Tên công ty'}
            </h5>
            <p className="text-gray-600">Đăng nhập để tiếp tục</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-blue-600 text-lg font-medium mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full rounded border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-600 text-lg font-medium mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="mr-2"
                  />
                  Nhớ đăng nhập
                </label>
                <Link href="/forgot-password" className="text-blue-500 text-sm">
                  Quên mật khẩu?
                </Link>

              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded text-lg hover:bg-blue-700"
              >
                Đăng nhập
              </button>
            </form>

            <div className="flex flex-col justify-center space-y-4">
              <button
                type="button"
                onClick={() => handleLoginSocial('facebook')}
                className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900"
              >
                Đăng nhập với Facebook
              </button>
              <div className="text-center text-gray-400">Hoặc</div>
              <button
                type="button"
                onClick={() => handleLoginSocial('google')}
                className="w-full bg-white border border-gray-300 py-2 rounded hover:bg-gray-100"
              >
                Đăng nhập với Google
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 text-red-600 text-center text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
