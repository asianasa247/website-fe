'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  const [showMore, setShowMore] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [companyIfo, setCompanyInfo] = useState<any>(null);
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
        header?.classList.add('shadow-lg');
      } else {
        header?.classList.remove('shadow-lg');
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
    <header className="relative">
      {/* Top info bar */}
      <div className="bg-primary text-primary text-sm w-full py-2 hidden md:block">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-6 py-1">
          <div className="flex gap-6 items-center">
            <span>{companyIfo?.phone}</span>
            <span>{companyIfo?.email}</span>
            <span>{companyIfo?.address}</span>
            <span>{companyIfo?.websiteName}</span>
          </div>
          <div className="flex gap-2 items-center">
            {socials?.map((social: any) => (
              <a
                key={social.id || social.title}
                href={social.shortContent}
                title={social.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={`${url}/${social.fileUrl}`} alt={social.title} className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="flex items-center justify-between px-4 md:px-10 py-4 border-b bg-white">
        {/* Logo */}
        {companyLogo && (
          <div>
            <Image src={companyLogo || '/logo'} alt="Logo" width={120} height={48} />
          </div>
        )}

        {/* Hamburger icon for mobile */}
        <div className="md:hidden text-3xl" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-1 ml-10">
          <ul className="flex gap-8 font-semibold relative">
            {mainMenu.map(item => (
              <li key={item.code} className="cursor-pointer hover:text-green-600">
                <Link href={item.typeMenu}>{item.name}</Link>
              </li>
            ))}
            {moreMenu.length > 0 && (
              <li
                className="relative cursor-pointer hover:text-green-600 flex items-center gap-1"
                onMouseEnter={() => setShowMore(true)}
                onMouseLeave={() => setShowMore(false)}
              >
                Xem thêm
                <span className="text-xs">▼</span>
                {showMore && (
                  <ul className="absolute left-0 top-full mt-2 bg-white border rounded shadow-lg min-w-[160px] z-50">
                    {moreMenu.map(item => (
                      <li key={item.code} className="px-4 py-2 hover:bg-green-50">
                        <Link href="/">{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Search + Actions (desktop only) */}
        <div className="hidden md:flex items-center">
          <form className="flex items-center border border-green-100 rounded-full px-4 py-1 mr-6">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="outline-none border-none bg-transparent px-2 py-1 text-green-700"
            />
            <button type="submit" className="text-green-500 text-lg">
              <FiSearch />
            </button>
          </form>
          <div className="flex gap-3 items-center">
            <Link href="/sign-in" className="text-green-600 hover:text-green-800">Đăng nhập</Link>
            <Link href="/sign-up" className="text-green-600 hover:text-green-800">Đăng ký</Link>
            <button className="text-xl hover:text-green-600">🤍</button>
            <button className="text-xl hover:text-green-600">🛒</button>
            <button className="border border-green-400 rounded px-3 py-1 ml-2 hover:bg-green-50">
              🇻🇳
              {' '}
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
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
