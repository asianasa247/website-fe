'use client';

import DOMPurify from 'dompurify';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNewsDetail, getNewsList } from '../../api/news';

const NewsDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<any | null>(null);
  const [newsList, setNewsList] = useState<any[]>([]);

  const id = params?.id;

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      router.push('/news');
      return;
    }

    const loadNewsDetail = async () => {
      try {
        const data = await getNewsDetail(Number(id));
        setNews(data);
      } catch {
        router.push('/news');
      }
    };

    const loadNewsList = async () => {
      try {
        const response = await getNewsList({ Page: 1, PageSize: 20, Type: 'vi' });
        const filtered = response.data.filter((item: any) => item.id !== Number(id)).slice(0, 5);
        setNewsList(filtered);
      } catch (err) {
        console.error('Failed to fetch news list:', err);
      }
    };

    loadNewsDetail();
    loadNewsList();
  }, [id]);

  if (!news) {
    return <p>Đang tải...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <img
            src={news.file?.[0]?.fileUrl || '/images/no-image.png'}
            alt={news.title}
            className="w-full rounded"
          />
          <div className="text-gray-500 mt-2">
            by
            {' '}
            <strong>Admin</strong>
            {' '}
            -
            {' '}
            {new Date(news.createAt).toLocaleDateString('vi-VN')}
          </div>
          <h1 className="text-3xl font-bold mt-2">{news.title}</h1>
          <p className="font-medium text-base mt-1">{news.shortContent}</p>
          <div
            className="prose mt-5"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(news.content || ''),
            }}
          >
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Tìm kiếm</h2>
          <input
            type="text"
            placeholder="Tìm kiếm tin tức"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />

          <h2 className="text-2xl font-bold mt-8 mb-3">Tin tức liên quan</h2>
          <div className="space-y-4">
            {newsList.map(item => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.images?.[0]?.fileUrl || '/images/no-image.png'}
                  alt={item.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <a href={`/news/${item.id}`} className="font-semibold hover:text-orange-500">
                    {item.title}
                  </a>
                  <div className="text-gray-600 text-sm mt-1">
                    <i className="pi pi-user mr-1" />
                    {' '}
                    {item.author}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <i className="pi pi-calendar mr-1" />
                    {' '}
                    {new Date(item.publishDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
