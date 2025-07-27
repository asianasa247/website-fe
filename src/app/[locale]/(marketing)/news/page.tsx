/* eslint-disable react/no-array-index-key */
// components/NewsList.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNewsList } from '../api/news';

type NewsItem = {
  id: number;
  title: string;
  shortContent: string;
  createAt: string;
  images: { fileUrl: string }[] | null;
};

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const serverUrlImage = process.env.NEXT_PUBLIC_SERVER_URL_IMAGE || 'https://default-image-url.com/';

  useEffect(() => {
    getNewsList({ page, pageSize })
      .then((data) => {
        setNews(data.data);
        setTotalItems(data.totalItems);
      })
      .catch((error) => {
        console.error('Failed to fetch news:', error);
      });
  }, [page]);

  if (!totalItems) {
    return null;
  }

  return (
    <div className="new-wrap px-2 py-2 lg:py-4 lg:px-8">
      <div className="news grid gap-4">
        {news.map(el => (
          <Link key={el.id} href={`/news/${el.id}`} className="block new">
            <div className="new flex gap-4">
              <div className="new-image w-[200px] min-w-[200px]">
                <Image
                  src={serverUrlImage + el.images?.[0]?.fileUrl || '/placeholder.jpg'}
                  alt={el.title}
                  width={200}
                  height={130}
                  className="object-cover w-full h-[130px]"
                />
              </div>
              <div className="new-content flex-1">
                <div className="new-title text-xl font-semibold mb-1">{el.title}</div>
                <div className="new-desc text-gray-700 mb-2">
                  {el.shortContent}
                  {' '}
                  <Link href={`/news/${el.id}`} className="text-green-600 hover:underline">
                    (Xem thêm...)
                  </Link>
                </div>
                <div className="new-ext text-sm text-gray-500">
                  bởi
                  {' '}
                  <strong className="text-black">Admin</strong>
                  {' '}
                  -
                  {' '}
                  {new Date(el.createAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Simple pagination */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(totalItems / pageSize) }).map((_, i) => (
          <button
            type="button"
            key={i.toString()}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? 'bg-green-600 text-white' : 'bg-white text-black'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
