import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getCompanyInfo, getIntroduceList, getProductsByCategory, getSocials, getWebCategories, subscribeMail } from '@/services/api';

const Footer = () => {
  const { t, i18n } = useTranslation();

  const [webCategories, setWebCategories] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [aboutList, setAboutList] = useState([]);
  const [socials, setSocials] = useState([]);

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    getCompanyInfo().then(res => setCompanyInfo(res.data));
    getIntroduceList().then(res => setAboutList(res.data));
    getSocials().then(setSocials);

    getWebCategories().then(async (res) => {
      const categories = res.data.filter(c => c.type === 7);
      const items = await Promise.all(
        categories.map(async (cat) => {
          const products = await getProductsByCategory({ menuType: cat.code });
          return { ...cat, label: cat.name, icon: cat.icon, products };
        }),
      );
      setWebCategories(items);
    });
  }, []);

  const getTitle = (item) => {
    const lang = i18n.language;
    if (lang === 'en') {
      return item.titleEnglish || item.title;
    }
    if (lang === 'ko') {
      return item.titleKorean || item.title;
    }
    return item.title;
  };

  const loadNameCategoryByLang = (cat) => {
    const lang = i18n.language;
    if (lang === 'en') {
      return cat.nameEnglish || cat.name;
    }
    if (lang === 'ko') {
      return cat.nameKorea || cat.name;
    }
    return cat.name;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      return;
    }
    try {
      await subscribeMail(email, phoneNumber, note);
      alert(t('label.register_email_success'));
    } catch (err) {
      alert('Subscription failed');
    }
  };

  return (
    <div className="footer-wrapper bg-gray-100 text-gray-800 mt-10 px-6 py-10">
      <hr className="mb-6" />

      {/* Danh mục chuyên mục */}
      <div className="category-list flex flex-wrap gap-4 justify-center mb-6">
        {webCategories.map(item => (
          <div key={item.code} className="category-item flex items-center gap-2">
            <a href={`#${item.code}`} className="flex items-center gap-2 hover:underline">
              {item.icon && (
                <Image
                  src={process.env.NEXT_PUBLIC_SERVER_IMAGE + item.icon}
                  width={28}
                  height={28}
                  alt="icon"
                  className="object-contain"
                  onError={e => e.currentTarget.style.display = 'none'}
                />
              )}
              <span className="text-sm">{loadNameCategoryByLang(item)}</span>
            </a>
          </div>
        ))}
      </div>

      <hr className="mb-6" />

      {/* Footer columns */}
      <div className="footer-columns grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        {/* Cột 1 */}
        <div className="footer-col">
          <h5 className="font-semibold mb-2 text-base">{companyInfo?.name}</h5>
          <p>
            <strong>
              {t('label.address')}
              :
            </strong>
            {' '}
            {companyInfo?.address}
          </p>
          <p>
            <strong>
              {t('label.tax_code')}
              :
            </strong>
            {' '}
            {companyInfo?.mst}
            <br />
            <strong>
              {t('label.phone')}
              :
            </strong>
            {' '}
            {companyInfo?.phone}
          </p>
          <p>
            <strong>
              {t('label.email')}
              :
            </strong>
            {' '}
            {companyInfo?.email}
          </p>
        </div>

        {/* Cột 2 */}
        <div className="footer-col">
          <h5 className="font-semibold mb-2 text-base">{t('label.terms_conditions')}</h5>
          {aboutList.map(item => (
            <div key={item.id}>
              <Link href={item.link || `/introduce/${item.id}`} className="text-blue-600 hover:underline">
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
              placeholder={t('label.your_email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <input
              type="tel"
              placeholder={t('label.phone')}
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <textarea
              rows={2}
              placeholder="Ý kiến của bạn."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            >
            </textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Gửi
            </button>
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
                <Image
                  src={social.fileUrl}
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
