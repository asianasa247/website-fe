/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaShoppingCart } from 'react-icons/fa';
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
  const [socials, setSocials] = useState<any[]>([]);
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
        if (typeof companyData.defautlThemeweb === 'string') {
          localStorage.setItem('defautlThemeweb', companyData.defautlThemeweb);
        }
      }
    });

    dashboardService.getListWebCategory().then((res: any) => {
      setMenu(transformToHierarchicalMenu(res.data));
    });

    dashboardService.getSocials().then((res: any) => {
      setSocials(res);
    });

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
      if (window.scrollY > 50) {
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

      // dọn cache tiện ích nội bộ (nếu có)
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
    <header className="w-full bg-white relative">
      {/* ✅ Top bar */}
      <FloatingActions />
      <div className="bg-gray-50  text-xs hidden md:block py-2">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-1 text-gray-700">
          {/* Thông tin công ty */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <FaPhoneAlt className="" />
              {' '}
              {companyInfo?.phone}
            </span>
            <span className="flex items-center gap-1">
              <FaEnvelope className="" />
              {' '}
              {companyInfo?.email}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="" />
              {' '}
              {companyInfo?.address}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="" />
              {' '}
              07:30 - 19:00 Thứ Hai - Chủ nhật
            </span>
          </div>

          {/* Mạng xã hội */}
          <div className="flex gap-2">
            {socials?.map((social: any) => (
              <a
                key={social.id || social.title}
                href={social.shortContent}
                title={social.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={`${url}/${social.fileUrl}`} alt={social.title} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Main nav bar */}
      <div className="flex items-center justify-between px-4 md:px-16 py-3  " style={{ backgroundColor: theme.primaryColor }}>
        {/* Logo */}
        {companyLogo && (
          <Link href="/">
            <img src={companyLogo} alt="Logo" width={60} height={60} />
          </Link>
        )}

        {/* Hamburger cho mobile */}
        <button type="button" className="md:hidden text-3xl" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </button>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1  justify-start" style={{ color: theme.textColor }}>
          <ul className="flex gap-6 font-medium ">
            {mainMenu.map(item => (
              <li key={item.code} className="cursor-pointer  transition">
                <Link href={item.typeMenu}>{item.name}</Link>
              </li>
            ))}
            {moreMenu.length > 0 && (
              <li
                className="relative cursor-pointer  flex items-center gap-1 group"
              >
                Xem thêm
                {' '}
                <span className="text-xs">▼</span>
                <ul className="absolute left-0 top-full mt-2 bg-white border rounded shadow-lg min-w-[160px] hidden group-hover:block z-50">
                  {moreMenu.map(item => (
                    <li key={item.code} className="px-4 py-2 hover:bg-green-50">
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
          <form className="flex items-center border  rounded-full px-3 py-1" style={{ borderColor: theme.textColor }}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="outline-none border-none bg-transparent px-2 w-[120px]"
              style={{ color: theme.textColor }}
            />
            <button type="submit" style={{ color: theme.textColor }} className=" text-lg">
              <FiSearch />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            style={{ borderColor: theme.textColor, color: theme.textColor }}
            className="relative w-9 h-9 border   rounded-full flex items-center justify-center hover:bg-green-50 transition-colors"
          >
            <FaShoppingCart />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth Buttons */}
          {!isLoggedIn
            ? (
                <>
                  <Link href="/sign-in" className="px-3 py-1 border  rounded-full  hover:bg-green-50" style={{ borderColor: theme.textColor, color: theme.textColor }}>
                    Đăng nhập
                  </Link>
                  <Link href="/sign-up" className="px-3 py-1 border  rounded-full  hover:bg-green-50" style={{ borderColor: theme.textColor, color: theme.textColor }}>
                    Đăng ký
                  </Link>
                </>
              )
            : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1 border  rounded-full hover:bg-green-50"
                  style={{ borderColor: theme.textColor, color: theme.textColor }}
                  title="Đăng xuất"
                >
                  Đăng xuất
                </button>
              )}

          <button type="button" className="w-9 h-9 border  rounded-full flex items-center justify-center hover:bg-green-50" style={{ borderColor: theme.textColor, color: theme.textColor }}>
            🤍
          </button>
          <button type="button" className="w-9 h-9 border  rounded-full flex items-center justify-center hover:bg-green-50" style={{ borderColor: theme.textColor, color: theme.textColor }}>
            🛒
          </button>
          <button type="button" className="flex items-center gap-1 px-3 py-1 border  rounded-md hover:bg-green-50" style={{ borderColor: theme.textColor, color: theme.textColor }}>
            🇻🇳
            {' '}
            <span className="text-xs">▼</span>
          </button>
        </div>

        {/* Cart button mobile */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          style={{ borderColor: theme.textColor, color: theme.textColor }}
          className="md:hidden fixed bottom-4 right-4 z-50  text-white p-4 rounded-full shadow-lg"
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

      <div className="fixed right-4 bottom-28 md:bottom-24 md:right-6 z-[10000000] pointer-events-none">
        <div className="pointer-events-auto">
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
                      <Link href="/sign-in" onClick={() => setShowMobileMenu(false)} className="block px-2 py-2 rounded border">
                        Đăng nhập
                      </Link>
                    </li>
                    <li className="py-2">
                      <Link href="/sign-up" onClick={() => setShowMobileMenu(false)} className="block px-2 py-2 rounded border">
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
                      className="w-full text-left px-2 py-2 rounded border"
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
