/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';

type CompanyInfo = {
  name?: string;
  fileLogo?: string;
  [key: string]: unknown;
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

type NormalizedUser = {
  id: number;
  code: string;
  name: string;
  avatar: string | null;
  email: string | null;
  phone: string;
  isSocial?: boolean;
};

// Mềm hoá kiểu của authService để không lỗi khi gọi các helper nếu có
type AuthServiceLike = typeof authService & {
  setToken?: (t: string) => void;
  setUser?: (u: NormalizedUser) => void;
  initAuthenticated?: () => void;
  userInfo?: NormalizedUser | null;
  loginSocial?: (provider: 'FACEBOOK' | 'GOOGLE', token: string) => Promise<unknown>;
};
const auth = authService as AuthServiceLike;

// Không augment Window (tránh eslint ts/consistent-type-definitions)
type Win = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize?: (opts: {
          client_id: string;
          callback: (res: unknown) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        prompt?: (cb?: (n: unknown) => void) => void;
      };
    };
  };
  fbAsyncInit?: () => void;
  FB?: {
    init: (opts: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
    login: (cb: (resp: unknown) => void, opts?: { scope?: string }) => void;
  };
};

// ---- Helpers ----
function normalizeLoginResponse(raw: unknown): LoginOkResponse {
  const r = raw as Record<string, unknown>;
  return {
    Id: Number(((r.Id as number | undefined) ?? (r.id as number | undefined) ?? 0)),
    Username: String(((r.Username as string | undefined) ?? (r.username as string | undefined) ?? (r.Code as string | undefined) ?? (r.code as string | undefined) ?? '')),
    Fullname: String(((r.Fullname as string | undefined) ?? (r.fullname as string | undefined) ?? (r.Name as string | undefined) ?? (r.name as string | undefined) ?? '')),
    Avatar: ((r.Avatar as string | undefined) ?? (r.avatar as string | undefined) ?? null) as string | null,
    Token: String(((r.Token as string | undefined) ?? (r.token as string | undefined) ?? (r.AccessToken as string | undefined) ?? (r.accessToken as string | undefined) ?? '')),
    Email: ((r.Email as string | undefined) ?? (r.email as string | undefined) ?? null) as string | null,
    Phone: String(((r.Phone as string | undefined) ?? (r.phone as string | undefined) ?? (r.PhoneNumber as string | undefined) ?? (r.phoneNumber as string | undefined) ?? '')),
  };
}

function useLoadScript(src: string, id: string) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    if (document.getElementById(id)) {
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.id = id;
    document.body.appendChild(s);
  }, [src, id]);
}

export default function Login() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://default-api-url.com';
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  // Load SDKs
  useLoadScript('https://accounts.google.com/gsi/client', 'google-gsi');
  // Facebook SDK được chèn trong effect fb để tránh race với fbAsyncInit

  const googleInitializedRef = useRef(false);
  const facebookInitializedRef = useRef(false);

  // ---- SOCIAL LOGIN → gửi token về BE /WebAuth/login-social ----
  async function loginSocialToBE(provider: 'FACEBOOK' | 'GOOGLE', token: string) {
    try {
      let raw: unknown;
      if (typeof auth.loginSocial === 'function') {
        raw = await auth.loginSocial(provider, token);
      } else {
        const r = await fetch(`${apiBase}/api/WebAuth/login-social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Provider: provider, Token: token }),
          credentials: 'include',
        });
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        raw = await r.json();
      }

      const res = normalizeLoginResponse(raw);

      if (!res.Token) {
        throw new Error('Token rỗng từ máy chủ');
      }

      auth.setToken?.(res.Token);
      const normalizedUser: NormalizedUser = {
        id: res.Id,
        code: res.Username,
        name: res.Fullname,
        avatar: res.Avatar,
        email: res.Email,
        phone: res.Phone,
        isSocial: true,
      };
      auth.setUser?.(normalizedUser);
      auth.userInfo = normalizedUser;
      auth.initAuthenticated?.();

      router.push('/');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string } }; message?: string };
      const msg = err?.response?.data?.msg || err?.response?.data?.message || err?.message || 'Đăng nhập MXH thất bại';
      setErrorMessage(msg);
    }
  }

  // Init Facebook SDK (đặt fbAsyncInit trước rồi mới chèn script để tránh race)
  useEffect(() => {
    if (facebookInitializedRef.current) {
      return;
    }
    if (!facebookAppId) {
      return;
    }

    (window as Win).fbAsyncInit = function () {
      (window as Win).FB?.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      });
      facebookInitializedRef.current = true;
    };

    if (!document.getElementById('facebook-jssdk')) {
      const s = document.createElement('script');
      s.src = 'https://connect.facebook.net/en_US/sdk.js';
      s.async = true;
      s.defer = true;
      s.id = 'facebook-jssdk';
      document.body.appendChild(s);
    }
  }, [facebookAppId]);

  // Init Google (chỉ khi có client id)
  useEffect(() => {
    if (!googleClientId) {
      return;
    }
    const tryInit = () => {
      if (googleInitializedRef.current) {
        return;
      }
      if (!(window as Win).google?.accounts?.id) {
        return;
      }
      (window as Win).google?.accounts?.id?.initialize?.({
        client_id: googleClientId,
        callback: async (response) => {
          const r = response as { credential?: string };
          const idToken = r?.credential;
          if (!idToken) {
            setErrorMessage('Không lấy được Google ID token');
            return;
          }
          await loginSocialToBE('GOOGLE', idToken);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleInitializedRef.current = true;
    };

    const t = setInterval(() => {
      tryInit();
      if (googleInitializedRef.current) {
        clearInterval(t);
      }
    }, 150);

    return () => {
      clearInterval(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  // Company info (logo, tên) → gọi /api/Companies/get-company và lấy field name
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/api/Companies/get-company`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        const json = await r.json();
        const payload = (json?.data as CompanyInfo) ?? (json as CompanyInfo);
        if (payload) {
          setCompanyInfo(payload);
          if (payload.fileLogo) {
            setCompanyLogo(`${apiBase}/${payload.fileLogo}`);
          }
        }
      })
      .catch(() => {
        // ignore
      });
    return () => {
      controller.abort();
    };
  }, [apiBase]);

  // ---- SUBMIT ACCOUNT/PASSWORD ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const raw = await authService.login(phoneNumber.trim(), password);
      const res = normalizeLoginResponse(raw as unknown);

      if (!res.Token) {
        throw new Error('Token rỗng từ máy chủ');
      }

      auth.setToken?.(res.Token);
      const normalizedUser: NormalizedUser = {
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
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string } }; message?: string };
      const msg = err?.response?.data?.msg || err?.response?.data?.message || err?.message || 'Đăng nhập thất bại';
      setErrorMessage(msg);
    }
  };

  const handleLoginWithFacebook = async () => {
    setErrorMessage('');
    try {
      if (!facebookAppId) {
        setErrorMessage('Thiếu NEXT_PUBLIC_FACEBOOK_APP_ID');
        return;
      }
      if (!(window as Win).FB || !facebookInitializedRef.current) {
        setErrorMessage('Facebook SDK chưa sẵn sàng');
        return;
      }
      (window as Win).FB?.login(
        async (resp) => {
          const r = resp as { authResponse?: { accessToken?: string } };
          const accessToken = r?.authResponse?.accessToken;
          if (accessToken) {
            await loginSocialToBE('FACEBOOK', accessToken);
          } else {
            setErrorMessage('Bạn đã huỷ đăng nhập Facebook');
          }
        },
        { scope: 'public_profile,email' },
      );
    } catch (e: unknown) {
      const err = e as { message?: string };
      setErrorMessage(err?.message || 'Lỗi đăng nhập Facebook');
    }
  };

  const handleLoginWithGoogle = () => {
    setErrorMessage('');
    if (!googleClientId) {
      setErrorMessage('Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID');
      return;
    }
    if (!(window as Win).google?.accounts?.id || !googleInitializedRef.current) {
      setErrorMessage('Google SDK chưa sẵn sàng');
      return;
    }
    (window as Win).google?.accounts?.id?.prompt?.(() => {
      // handle state if needed
    });
  };

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
            <h5 className="text-2xl font-semibold text-blue-600 mb-2">{companyInfo?.name || 'Tên công ty'}</h5>
            <p className="text-gray-600">Đăng nhập để tiếp tục</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-blue-600 text-lg font-medium mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full rounded border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-600 text-lg font-medium mb-1">Mật khẩu</label>
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

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded text-lg hover:bg-blue-700">
                Đăng nhập
              </button>
            </form>

            <div className="flex flex-col justify-center space-y-4">
              <button
                type="button"
                onClick={handleLoginWithFacebook}
                className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900"
              >
                Đăng nhập với Facebook
              </button>
              <div className="text-center text-gray-400">Hoặc</div>
              <button
                type="button"
                onClick={handleLoginWithGoogle}
                className="w-full bg-white border border-gray-300 py-2 rounded hover:bg-gray-100"
              >
                Đăng nhập với Google
              </button>
            </div>
          </div>

          {errorMessage && <div className="mt-4 text-red-600 text-center text-sm">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
}
