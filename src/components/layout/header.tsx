/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { FiMenu, FiSearch, FiX } from 'react-icons/fi';

import authService from '@/app/[locale]/(marketing)/api/auth';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';

export type MenuItemModel = {
  code: string;
  codeParent?: string;
  type: number;
  isShowWeb: boolean;
  numberItem?: number;
  children?: MenuItemModel[];
  [key: string]: any;
};

export default function Header() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://default-api-url.com';
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [socials, setSocials] = useState<any[]>([]);

  useEffect(() => {
    authService.getCompany().then((company) => {
      if (company) {
        setCompanyInfo(company.data);
        setCompanyLogo(`${url}/${company.data.fileLogo}`);
      }
    });

    dashboardService.getListWebCategory().then((res) => {
      setMenu(transformToHierarchicalMenu(res.data));
    });
    dashboardService.getSocials().then((res) => {
      setSocials(res);
    });

    const handleScroll = () => {
      const header = document.querySelector('header');
      if (window.scrollY > 50) {
        header?.classList.add('shadow-md');
      } else {
        header?.classList.remove('shadow-md');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="bg-gray-50 border-b text-xs hidden md:block">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-1 text-gray-700">
          {/* Thông tin công ty */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <FaPhoneAlt className="text-green-600" />
              {' '}
              {companyInfo?.phone}
            </span>
            <span className="flex items-center gap-1">
              <FaEnvelope className="text-green-600" />
              {' '}
              {companyInfo?.email}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-green-600" />
              {' '}
              {companyInfo?.address}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-green-600" />
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
      <div className="flex items-center justify-between px-4 md:px-10 py-3 border-b bg-white">
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
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex gap-6 font-medium text-green-700">
            {mainMenu.map(item => (
              <li key={item.code} className="cursor-pointer hover:text-green-500 transition">
                <Link href={item.typeMenu}>{item.name}</Link>
              </li>
            ))}
            {moreMenu.length > 0 && (
              <li
                className="relative cursor-pointer hover:text-green-500 flex items-center gap-1 group"
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
          <form className="flex items-center border border-green-400 rounded-full px-3 py-1">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="outline-none border-none bg-transparent px-2 text-green-700 w-[120px]"
            />
            <button type="submit" className="text-green-500 text-lg">
              <FiSearch />
            </button>
          </form>

          {/* Buttons */}
          <Link href="/sign-in" className="px-3 py-1 border border-green-400 rounded-full text-green-600 hover:bg-green-50">
            Đăng nhập
          </Link>
          <Link href="/sign-up" className="px-3 py-1 border border-green-400 rounded-full text-green-600 hover:bg-green-50">
            Đăng ký
          </Link>
          <button type="button" className="w-9 h-9 border border-green-400 rounded-full flex items-center justify-center hover:bg-green-50">
            🤍
          </button>
          <button type="button" className="w-9 h-9 border border-green-400 rounded-full flex items-center justify-center hover:bg-green-50">
            🛒
          </button>
          <button type="button" className="flex items-center gap-1 px-3 py-1 border border-green-400 rounded-md hover:bg-green-50">
            🇻🇳
            {' '}
            <span className="text-xs">▼</span>
          </button>
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
          </ul>
        </div>
      )}
    </header>
  );
}
