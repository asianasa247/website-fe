/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import authService from '@/app/[locale]/(marketing)/api/auth';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import { getIntroduceList } from '@/app/[locale]/(marketing)/api/introduceService';

const Footer = () => {
  const [companyInfo, setCompanyInfo] = useState<any>();
  const [aboutList, setAboutList] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string>('');

  const [themeColors, setThemeColors] = useState<any>(null);

  useEffect(() => {
    authService.getCompany().then((company) => {
      if (company) {
        setCompanyInfo(company.data);
        const raw = (company.data as any)?.defautl_themeweb ?? (company.data as any)?.defautlThemeweb;
        if (typeof raw === 'string' && raw.trim()) {
          try {
            const parsed = JSON.parse(raw);
            setThemeColors(parsed);
          } catch {
            // ignore
          }
        }
      } else {
        console.warn('No company data found');
      }
    });
    dashboardService.getSocials().then((res) => {
      setSocials(res);
    }).catch((error) => {
      console.error('Failed to fetch socials:', error);
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
      className="footer-wrapper mt-10 px-6 py-10 font-bold border-t"
      style={{
        color: themeColors?.textColorSecondary ?? '#374151',
        backgroundColor: themeColors?.primaryColor ?? '#f3f4f6',
      }}
    >

      {/* Footer columns */}
      <div
        className="footer-columns grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm"
        style={{ color: themeColors?.textColorSecondary ?? '#374151' }}
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
              className="w-full px-3 py-2 border rounded mb-2 "
              style={{
                color: themeColors?.textColorSecondary,
              }}
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Số điện thoại"
              className="w-full px-3 py-2 border rounded mb-2 "
              style={{
                color: themeColors?.textColorSecondary,
              }}
            />
            <textarea
              rows={2}
              placeholder="Ý kiến của bạn."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
              style={{
                color: themeColors?.textColorSecondary,
              }}
            >
            </textarea>
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-blue-500 py-2 px-4 rounded disabled:opacity-60"
              style={{
                background: themeColors?.textColorSecondary,
              }}
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
