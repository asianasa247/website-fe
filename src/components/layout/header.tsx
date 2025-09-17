/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaClock, FaEnvelope, FaFacebookSquare, FaMapMarkerAlt, FaPhoneAlt, FaShoppingCart } from 'react-icons/fa';
import { FiMenu, FiSearch, FiX } from 'react-icons/fi';

import authService from '@/app/[locale]/(marketing)/api/auth';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import { useCart } from '@/context/cart-context';
import { useTheme } from '@/context/theme-provider';
import { CartModal } from '../CartModal';
import ChatSupportButton from '../ChatSupportButton';
import FloatingActions from '../FloatingActions';

export type MenuItemModel = {
  code: string;
  codeParent?: string;
  type: number;
  isShowWeb: boolean;
  numberItem?: number;
  children?: MenuItemModel[];
  [key: string]: any;
};

type CompanyPayload = {
  fileLogo?: string;
  defautlThemeweb?: string;
  phone?: string;
  email?: string;
  address?: string;
  [k: string]: any;
};

export default function Header() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://default-api-url.com';
  const theme = useTheme();
  const router = useRouter();

  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyPayload | null>(null);
  // const [socials, setSocials] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { state: cartState } = useCart();
  const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    authService.getCompany().then((company: unknown) => {
      const data = (company as any)?.data ?? (company as CompanyPayload);
      if (data) {
        const companyData = data as CompanyPayload;
        setCompanyInfo(companyData);

        if (companyData.fileLogo) {
          setCompanyLogo(`${url}/${companyData.fileLogo}`);
        }

        // ✅ Lấy theme từ API: hỗ trợ cả defautl_themeweb (underscore) và defautlThemeweb (camel)
        const themeRaw = (companyData as any).defautl_themeweb ?? (companyData as any).defautlThemeweb;

        if (typeof themeRaw === 'string' && themeRaw.trim()) {
          localStorage.setItem('defautlThemeweb', themeRaw);
          try {
            const parsed = JSON.parse(themeRaw);
            if (parsed && typeof parsed === 'object') {
              (theme as any).primaryColor = parsed.primaryColor ?? (theme as any).primaryColor;
              (theme as any).primaryColorText = parsed.primaryColorText ?? (theme as any).primaryColorText;
              (theme as any).textColor = parsed.textColor ?? (theme as any).textColor;
              (theme as any).textColorSecondary = parsed.textColorSecondary ?? (theme as any).textColorSecondary;
              (theme as any).lightPrimaryColor = parsed.lightPrimaryColor ?? (theme as any).lightPrimaryColor;
              (theme as any).invalidPrimaryColor = parsed.invalidPrimaryColor ?? (theme as any).invalidPrimaryColor;
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    });

    dashboardService.getListWebCategory().then((res: any) => {
      setMenu(transformToHierarchicalMenu(res.data));
    });

    // dashboardService.getSocials().then((res: any) => {
    //   // setSocials(res);
    // });

    const token = typeof window !== 'undefined' ? localStorage.getItem('Token') : null;
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsLoggedIn(!!token);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'Token') {
        setIsLoggedIn(!!e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);

    const handleScroll = () => {
      const header = document.querySelector('header');
      if (window.scrollY > 8) {
        header?.classList.add('shadow-md');
      } else {
        header?.classList.remove('shadow-md');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('Token');
      localStorage.removeItem('auth-state');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('session');

      (authService as any)?.setToken?.('');
      (authService as any).userInfo = null;
    } catch {
      // noop
    }
    setIsLoggedIn(false);
    setShowMobileMenu(false);
    router.push('/sign-in');
  };

  const mainMenu = menu.slice(0, 5);
  const moreMenu = menu.slice(5);

  function transformToHierarchicalMenu(menuItems: MenuItemModel[]): MenuItemModel[] {
    const parentItems = menuItems.filter(item => item.type === 5 && item.isShowWeb);
    const itemMap = new Map<string, MenuItemModel>();
    menuItems.forEach(item => itemMap.set(item.code, { ...item, children: [] }));
    const result: MenuItemModel[] = [];

    parentItems.forEach((item) => {
      const menuItem = itemMap.get(item.code);
      if (!menuItem) {
        return;
      }
      if (item.codeParent) {
        const parent = itemMap.get(item.codeParent);
        if (parent) {
          parent.children?.push(menuItem);
        }
      } else {
        result.push(menuItem);
      }
    });

    menuItems.filter(item => item.type !== 5 && item.isShowWeb).forEach((item) => {
      if (item.codeParent) {
        const parent = itemMap.get(item.codeParent);
        const child = itemMap.get(item.code);
        if (parent && child) {
          parent.children?.push(child);
        }
      }
    });

    const sortByNumberItem = (items: MenuItemModel[]) =>
      items.sort((a, b) => (a.numberItem ?? 0) - (b.numberItem ?? 0));

    const sortedResult = sortByNumberItem(result);
    sortedResult.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children = sortByNumberItem(item.children);
      }
    });
    return sortedResult;
  }

  return (
    <header className="w-full relative sticky top-0 z-[1000] transition-shadow">
      {/* ✅ Top bar */}
      <FloatingActions />
      <div className="text-xs hidden md:block select-none" style={{ backgroundColor: theme.lightPrimaryColor, color: theme.lightPrimaryColor }}>
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-2">
          {/* Thông tin công ty */}
          <div className="flex items-center gap-4 flex-wrap font-bold" style={{ color: theme.lightPrimaryColor }}>
            <span className="flex items-center gap-1 font-bold" style={{ color: theme.textColorSecondary }}>
              <FaPhoneAlt className="" />
              {' '}
              {companyInfo?.phone}
            </span>
            <span className="flex items-center gap-1 font-bold" style={{ color: theme.textColorSecondary }}>
              <FaEnvelope className="" />
              {' '}
              {companyInfo?.email}
            </span>
            <span className="flex items-center gap-1 font-bold" style={{ color: theme.textColorSecondary }}>
              <FaMapMarkerAlt className="" />
              {' '}
              {companyInfo?.address}
            </span>
            <span className="flex items-center gap-1 font-bold" style={{ color: theme.textColorSecondary }}>
              <FaClock className="" />
              {' '}
              {companyInfo?.websiteName || '8:00 - 17:00'}
            </span>
          </div>

          {/* Phải: icon mạng xã hội (giữ nguyên) */}
          <div className="flex items-center gap-3 pr-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="inline-flex text-[#1877f2] hover:opacity-90 transition-opacity"
              aria-label="Facebook"
            >
              <FaFacebookSquare className="w-6 h-6" />
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              title="Zalo"
              className="inline-flex"
              aria-label="Zalo"
            >
              <img
                src="https://stc-zaloprofile.zdn.vn/pc/v1/images/zalo_sharelogo.png"
                alt="Zalo"
                className="w-6 h-6 rounded"
                referrerPolicy="no-referrer"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Main nav bar */}
      <div className="flex items-center justify-between px-4 md:px-16 py-3 border-b" style={{ backgroundColor: theme.primaryColor }}>
        {/* Logo */}
        {companyLogo && (
          <Link href="/" aria-label="Trang chủ" style={{ color: theme.textColorSecondary }}>
            <img src={companyLogo} alt="Logo" width={60} height={60} className="rounded-md hover:opacity-90 transition-opacity" />
          </Link>
        )}

        {/* Hamburger cho mobile */}
        <button type="button" className="md:hidden text-3xl" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Toggle menu">
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </button>

        {/* Menu Desktop - tăng khoảng cách với logo */}
        <nav className="hidden md:flex flex-1 justify-start ml-6">
          <ul className="flex gap-6 font-medium text-[#343a40]">
            {mainMenu.map(item => (
              <li key={item.code} className="cursor-pointer" style={{ color: theme.textColor }}>
                <Link
                  href={item.typeMenu}
                  className="relative inline-block py-1 transition-colors hover:text-[#e91e63] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e91e63]/40 rounded"
                >
                  <span className="after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-[#e91e63] hover:after:w-full after:transition-[width] after:duration-300">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
            {moreMenu.length > 0 && (
              <li
                className="relative cursor-pointer flex items-center gap-1 group text-[#343a40] hover:text-[#e91e63]"
                style={{ color: theme.textColor }}
              >
                Xem thêm
                {' '}
                <span className="text-xs">▼</span>
                <ul className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-xl min-w-[180px] hidden group-hover:block z-50 overflow-hidden">
                  {moreMenu.map(item => (
                    <li key={item.code} className="px-4 py-2 hover:bg-[#fff1f4]">
                      <Link href="/">{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </nav>

        {/* Search + Actions (desktop only) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search */}
          <form className="flex items-center border rounded-full px-3 py-1.5 focus-within:shadow-[0_0_0_3px_rgba(233,30,99,0.12)]" style={{ color: theme.textColor }}>
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="outline-none border-none bg-transparent px-2 w-[160px]"
              aria-label="Tìm kiếm"
              style={{ color: theme.textColor, border: theme.textColor }}
            />
            <button type="submit" className="text-lg" aria-label="Search" style={{ color: theme.textColor }}>
              <FiSearch />
            </button>
          </form>

          {/* Giỏ hàng ở header (giữ icon đen + badge) */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative w-9 h-9 border text-[#555] rounded-full flex items-center justify-center hover:bg-[#fff1f4] transition-colors"
            aria-label="Giỏ hàng"
            style={{ color: theme.textColor }}
          >
            <FaShoppingCart />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" style={{ color: theme.textColor }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth Buttons */}
          {!isLoggedIn
            ? (
                <>
                  <Link href="/sign-in" className="px-3 py-1.5 border rounded-full hover:bg-[#ffe5ea] transition-colors" style={{ color: theme.textColor }}>
                    Đăng nhập
                  </Link>
                  <Link href="/sign-up" className="px-3 py-1.5 border rounded-full hover:bg-[#ffe5ea] transition-colors" style={{ color: theme.textColor }}>
                    Đăng ký
                  </Link>
                </>
              )
            : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 border rounded-full hover:bg-[#ffe5ea] transition-colors"
                  title="Đăng xuất"
                  style={{ color: theme.textColor }}
                >
                  Đăng xuất
                </button>
              )}

          {/* Nút phụ: giữ 🤍, đã bỏ emoji 🛒 trùng */}
          <button type="button" className="w-9 h-9 border rounded-full flex items-center justify-center hover:bg-[#fff1f4]" aria-label="Yêu thích" style={{ color: theme.textColor }}>
            🤍
          </button>
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-[#ffe5ea]" style={{ color: theme.textColor }}>
            🇻🇳
            {' '}
            <span className="text-xs" style={{ color: theme.textColor }}>▼</span>
          </button>
        </div>

        {/* Cart button mobile (giữ nguyên) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          style={{ borderColor: theme.textColor, color: theme.textColor }}
          className="md:hidden fixed bottom-4 right-4 z-50  text-white p-4 rounded-full shadow-lg"
          aria-label="Giỏ hàng (mobile)"
        >
          <div className="relative">
            <FaShoppingCart className="text-xl" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </button>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Floating: social icons + chat support */}
      <div className="fixed right-4 bottom-60 md:bottom-43 md:right-6 z-[10000000] pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* ⬇️ 2 icon Facebook + Zalo (copy từ topbar) */}
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="inline-flex w-10 h-10 rounded-full bg-white shadow-md hover:opacity-90 transition-opacity items-center justify-center"
              aria-label="Facebook"
            >
              <FaFacebookSquare className="w-6 h-6 text-[#1877f2]" />
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              title="Zalo"
              className="inline-flex w-10 h-10 rounded-full bg-white shadow-md items-center justify-center"
              aria-label="Zalo"
            >
              <img
                src="https://stc-zaloprofile.zdn.vn/pc/v1/images/zalo_sharelogo.png"
                alt="Zalo"
                className="w-6 h-6 rounded"
                referrerPolicy="no-referrer"
              />
            </a>
          </div>

          <ChatSupportButton />
        </div>
      </div>

      {/* ✅ Mobile menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50">
          <ul className="flex flex-col gap-2 p-4">
            {menu.map(item => (
              <li key={item.code} className="border-b py-2">
                <Link href={item.typeMenu}>{item.name}</Link>
              </li>
            ))}

            {/* Auth actions for mobile */}
            {!isLoggedIn
              ? (
                  <>
                    <li className="py-2">
                      <Link href="/sign-in" onClick={() => setShowMobileMenu(false)} className="block px-2 py-2 rounded border border-[#ff4d6d] text-[#ff4d6d]">
                        Đăng nhập
                      </Link>
                    </li>
                    <li className="py-2">
                      <Link href="/sign-up" onClick={() => setShowMobileMenu(false)} className="block px-2 py-2 rounded border border-[#ff4d6d] text-[#ff4d6d]">
                        Đăng ký
                      </Link>
                    </li>
                  </>
                )
              : (
                  <li className="py-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-2 py-2 rounded border border-[#ff4d6d] text-[#ff4d6d]"
                    >
                      Đăng xuất
                    </button>
                  </li>
                )}
          </ul>
        </div>
      )}
    </header>
  );
}
