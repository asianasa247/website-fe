/* eslint-disable @next/next/no-img-element */
'use client';

import type { MenuItemModel } from './layout/header';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import { getIntroduceList } from '@/app/[locale]/(marketing)/api/introduceService';

const Footer = () => {
  const [webCategories, setWebCategories] = useState<any[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>();
  const [aboutList, setAboutList] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string>('');

  useEffect(() => {
    authService.getCompany().then((company) => {
      if (company) {
        setCompanyInfo(company.data);
      } else {
        console.warn('No company data found');
      }
    });
    dashboardService.getSocials().then((res) => {
      setSocials(res);
    }).catch((error) => {
      console.error('Failed to fetch socials:', error);
    });

    dashboardService.getListWebCategory().then((res) => {
      setWebCategories(transformToHierarchicalMenu(res.data));
    });
    getIntroduceList().then((res) => {
      setAboutList(res.data);
    }).catch((error) => {
      console.error('Failed to fetch about list:', error);
    });
  }, []);

  const getTitle = (item: any) => {
    return item.title;
  };

  const loadNameCategoryByLang = (cat: any) => {
    return cat.name;
  };
  function transformToHierarchicalMenu(menuItems: MenuItemModel[]): MenuItemModel[] {
  // Filter parent items with type = 5
    const parentItems = menuItems.filter(item => item.type === 5 && item.isShowWeb);

    // Map all menu items for lookup
    const itemMap = new Map<string, MenuItemModel>();
    menuItems.forEach((item) => {
      itemMap.set(item.code, { ...item, children: [] });
    });

    // Build hierarchical structure
    const result: MenuItemModel[] = [];

    parentItems.forEach((item) => {
      const menuItem = itemMap.get(item.code);
      if (!menuItem) {
        return;
      }

      if (item.codeParent) {
      // If the item has a parent, add it as a child
        const parent = itemMap.get(item.codeParent);
        if (parent) {
          parent.children?.push(menuItem);
        }
      } else {
      // Root items
        result.push(menuItem);
      }
    });

    // Add remaining children to their respective parents
    menuItems.filter(item => item.type !== 5 && item.isShowWeb).forEach((item) => {
      if (item.codeParent) {
        const parent = itemMap.get(item.codeParent);
        const child = itemMap.get(item.code);
        if (parent && child) {
          parent.children?.push(child);
        }
      }
    });

    // Sort items by 'numberItem'
    const sortByNumberItem = (items: MenuItemModel[]) => {
      return items.sort((a, b) => (a.numberItem ?? 0) - (b.numberItem ?? 0));
    };

    const sortedResult = sortByNumberItem(result);

    sortedResult.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children = sortByNumberItem(item.children);
      }
    });
    // Return the sorted result

    return sortedResult;
  }

  const handleSubscribe = async (e: any) => {
    e.preventDefault();
    setSubmitMsg('');
    if (!email) {
      setSubmitMsg('Vui lòng nhập email.');
      return;
    }
    setSubmitting(true);
    try {
      const base = 'https://bh.asianasa.com:8443/api/WebMails/';
      const qs = new URLSearchParams({
        email,
        phoneNumber,
        note,
      }).toString();

      const res = await fetch(`${base}?${qs}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setSubmitMsg('Gửi thành công. Cảm ơn bạn!');
        setEmail('');
        setPhoneNumber('');
        setNote('');
      } else {
        const text = await res.text().catch(() => '');
        setSubmitMsg(text || 'Gửi thất bại. Vui lòng thử lại.');
      }
    } catch {
      setSubmitMsg('Có lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="footer-wrapper text-gray-800 mt-10 px-6 py-10 font-bold border-t"
      style={{ color: '#374151', backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }}
    >

      {/* Danh mục chuyên mục */}
      <div
        className="category-list flex flex-wrap gap-4 justify-center mb-6"
        style={{ color: '#4b5563' }}
      >
        {webCategories.map(item => (
          <div key={item.code} className="category-item flex items-center gap-2">
            <a href={`#${item.code}`} className="flex items-center gap-2 hover:underline">
              <span className="text-sm">{loadNameCategoryByLang(item)}</span>
            </a>
          </div>
        ))}
      </div>

      {/* Footer columns */}
      <div
        className="footer-columns grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm"
        style={{ color: '#374151' }}
      >
        {/* Cột 1 */}
        <div className="footer-col">
          <h5 className="font-semibold mb-2 text-base">{companyInfo?.name}</h5>
          <p>
            <strong>
              Địa chỉ
              :
            </strong>
            {' '}
            {companyInfo?.address}
          </p>
          <p>
            <strong>
              Mã số thuế
              :
            </strong>
            {' '}
            {companyInfo?.mst}
            <br />
            <strong>
              Sô điện thoại
              :
            </strong>
            {' '}
            {companyInfo?.phone}
          </p>
          <p>
            <strong>
              Email
              :
            </strong>
            {' '}
            {companyInfo?.email}
          </p>
        </div>

        {/* Cột 2 */}
        <div className="footer-col">
          <h5 className="font-semibold mb-2 text-base">ĐIỀU KHOẢN & QUY ĐỊNH</h5>
          {aboutList.map(item => (
            <div key={item.id}>
              <Link href={item.link || `/introduce/${item.id}`} className=" hover:underline">
                {getTitle(item)}
              </Link>
            </div>
          ))}
        </div>
        {/* Cột 3 */}
        <div className="footer-col">
          <form onSubmit={handleSubscribe} className="subscribe-form">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email của bạn"
              required
              className="w-full px-3 py-2 border rounded mb-2 placeholder-gray-400"
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Số điện thoại"
              className="w-full px-3 py-2 border rounded mb-2 placeholder-gray-400"
            />
            <textarea
              rows={2}
              placeholder="Ý kiến của bạn."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2 placeholder-gray-400"
            >
            </textarea>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Gửi'}
            </button>
            {submitMsg && (
              <p className="mt-2 text-xs font-normal">
                {submitMsg}
              </p>
            )}
          </form>
        </div>

        {/* Cột 4 */}
        <div className="footer-col">
          <h5 className="font-semibold mb-2 text-base">Mạng xã hội</h5>
          <div className="flex gap-3 flex-wrap">
            {socials.map(social => (
              <a
                key={social.title}
                href={social.shortContent}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
                title={social.title}
              >
                <img
                  src={process.env.NEXT_PUBLIC_SERVER_URL_IMAGE + social.fileUrl}
                  width={32}
                  height={32}
                  alt="social-icon"
                  className="rounded"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
