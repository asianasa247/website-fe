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
  // const [companyInfo, setCompanyInfo] = useState<CompanyPayload | null>(null);
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
        // setCompanyInfo(companyData);
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
      <div className="bg-[#f5f2ff] text-[#6a60f6] text-sm hidden md:block">
        <div className="w-full flex justify-between items-center px-6 py-2">
          {/* Trái: dữ liệu cứng trải dài */}
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-2">
              <FaPhoneAlt className="text-[#6a60f6]" />
              {' '}
              0918 240 953 - 0901 254 598 - 0908799 090
            </span>
            <span className="flex items-center gap-2">
              <FaEnvelope className="text-[#6a60f6]" />
              {' '}
              nguyenthanhquanvt81@gmail.com
            </span>
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-[#6a60f6]" />
              {' '}
              1816 ĐƯỜNG VÕ VĂN KIỆT, ẤP TÂY, HÒA LONG, TP BÀ RỊA, TỈNH BR-VT
            </span>
            <span className="flex items-center gap-2">
              <FaClock className="text-[#6a60f6]" />
              {' '}
              07:30 - 17:00 Thứ Hai - Thứ Bảy
            </span>
          </div>

          {/* Phải: icon mạng xã hội cố định */}
          <div className="flex items-center gap-3 pr-1">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="inline-flex"
            >
              <img
                src="https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg"
                alt="Facebook"
                className="w-6 h-6"
              />
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              title="Zalo"
              className="inline-flex"
            >
              <img
                src="https://stc-zaloprofile.zdn.vn/pc/v1/images/Zalo.svg"
                alt="Zalo"
                className="w-6 h-6"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Main nav bar */}
      <div className="flex items-center justify-between px-4 md:px-16 py-3 border-b border-[#ededed] bg-white">
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
        <nav className="hidden md:flex flex-1 justify-start">
          <ul className="flex gap-6 font-medium text-[#343a40]">
            {mainMenu.map(item => (
              <li key={item.code} className="cursor-pointer transition hover:text-[#e91e63]">
                <Link href={item.typeMenu}>{item.name}</Link>
              </li>
            ))}
            {moreMenu.length > 0 && (
              <li
                className="relative cursor-pointer flex items-center gap-1 group text-[#343a40] hover:text-[#e91e63]"
              >
                Xem thêm
                {' '}
                <span className="text-xs">▼</span>
                <ul className="absolute left-0 top-full mt-2 bg-white border rounded shadow-lg min-w-[160px] hidden group-hover:block z-50">
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
          <form className="flex items-center border rounded-full px-3 py-1 border-[#e91e63] focus-within:shadow-[0_0_0_2px_rgba(233,30,99,0.15)]">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="outline-none border-none bg-transparent px-2 w-[140px] placeholder-gray-400 text-[#343a40]"
            />
            <button type="submit" className="text-lg text-[#e91e63]">
              <FiSearch />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative w-9 h-9 border border-[#e0e0e0] text-[#555] rounded-full flex items-center justify-center hover:bg-[#fff1f4] transition-colors"
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
                  <Link href="/sign-in" className="px-3 py-1 border border-[#ff4d6d] text-[#ff4d6d] rounded-full hover:bg-[#ffe5ea]">
                    Đăng nhập
                  </Link>
                  <Link href="/sign-up" className="px-3 py-1 border border-[#ff4d6d] text-[#ff4d6d] rounded-full hover:bg-[#ffe5ea]">
                    Đăng ký
                  </Link>
                </>
              )
            : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1 border border-[#ff4d6d] text-[#ff4d6d] rounded-full hover:bg-[#ffe5ea]"
                  title="Đăng xuất"
                >
                  Đăng xuất
                </button>
              )}

          <button type="button" className="w-9 h-9 border border-[#e0e0e0] text-[#555] rounded-full flex items-center justify-center hover:bg-[#fff1f4]">
            🤍
          </button>
          <button type="button" className="w-9 h-9 border border-[#e0e0e0] text-[#555] rounded-full flex items-center justify-center hover:bg-[#fff1f4]">
            🛒
          </button>
          <button type="button" className="flex items-center gap-1 px-3 py-1 border border-[#ff4d6d] text-[#ff4d6d] rounded-md hover:bg-[#ffe5ea]">
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
