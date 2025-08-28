/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';

type CompanyInfo = {
  name?: string;
  fileLogo?: string;
  [key: string]: any;
};

type LoginOkResponse = {
  Id: number;
  Username: string;
  Fullname: string;
  Avatar: string | null;
  Token: string;
  Email: string | null;
  Phone: string;
};

// Mềm hoá kiểu của authService để không lỗi khi gọi các helper nếu có
type AuthServiceLike = typeof authService & {
  setToken?: (t: string) => void;
  setUser?: (u: any) => void;
  initAuthenticated?: () => void;
  userInfo?: any;
};
const auth = authService as AuthServiceLike;

// Chuẩn hoá dữ liệu trả về từ BE thành LoginOkResponse
function normalizeLoginResponse(raw: any): LoginOkResponse {
  return {
    Id: Number(raw?.Id ?? raw?.id ?? 0),
    Username:
      String(raw?.Username ?? raw?.username ?? raw?.Code ?? raw?.code ?? '',
      ),
    Fullname: String(raw?.Fullname ?? raw?.fullname ?? raw?.Name ?? raw?.name ?? ''),
    Avatar: (raw?.Avatar ?? raw?.avatar ?? null) as string | null,
    Token: String(raw?.Token ?? raw?.token ?? raw?.AccessToken ?? raw?.accessToken ?? ''),
    Email: (raw?.Email ?? raw?.email ?? null) as string | null,
    Phone: String(raw?.Phone ?? raw?.phone ?? raw?.PhoneNumber ?? raw?.phoneNumber ?? ''),
  };
}

export default function Login() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://default-api-url.com';

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // Gọi đúng chữ ký: login(phone, password)
      const raw = await authService.login(phoneNumber.trim(), password);
      const res = normalizeLoginResponse(raw);

      // Lưu token + user (nếu app có các helper tương ứng)
      auth.setToken?.(res.Token);

      const normalizedUser = {
        id: res.Id,
        code: res.Username,
        name: res.Fullname,
        avatar: res.Avatar,
        email: res.Email,
        phone: res.Phone,
      };

      auth.setUser?.(normalizedUser);
      auth.userInfo = normalizedUser;
      auth.initAuthenticated?.();

      if (rememberMe) {
        localStorage.setItem('remember_me', '1');
      } else {
        localStorage.removeItem('remember_me');
      }

      router.push('/');
    } catch (err: unknown) {
      const e = err as any;
      const msg = e?.response?.data?.msg || e?.response?.data?.message || e?.message || 'Đăng nhập thất bại';
      setErrorMessage(msg);
    }
  };

  // Nếu sau này lấy token từ SDK Google/Facebook, sẽ gọi:
  // await authService.loginSocial('GOOGLE' | 'FACEBOOK', accessToken)
  const handleLoginSocial = async (provider: 'google' | 'facebook') => {
    setErrorMessage(
      `Cần access token từ SDK để gọi /WebAuth/login-social. Provider: ${provider}`,
    );
  };

  useEffect(() => {
    authService
      .getCompany()
      .then((company: any) => {
        const payload = company?.data ?? company;
        if (payload) {
          setCompanyInfo(payload);
          if (payload.fileLogo) {
            setCompanyLogo(`${url}/${payload.fileLogo}`);
          }
        }
      })
      .catch(() => {
        // không cần hiển thị lỗi ở đây
      });
  }, [url]);

  return (
    <div className="pb-10 pt-12 px-4 flex items-center justify-center">
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
