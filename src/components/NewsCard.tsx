'use client';

import Link from 'next/link';
import { useState } from 'react';

type Props = {
  categoryImages: { FileName: string }[];
  image: any;
  isSizeImage: boolean;
  news: any[];
  currentLanguage: 'vi' | 'en' | 'ko';
};

export default function NewsSection({
  categoryImages,
  image,
  isSizeImage,
  news,
  currentLanguage,
}: Props) {
  console.log('News Section:', image.length);
  const [max, setMax] = useState(4);

  const loadMore = () => {
    setMax(prev => prev + 6);
  };

  return (
    <div className="container mx-auto px-4">
      {/* Banners nếu có */}
      {image?.length > 0 && (
        <div className="mb-6">
          {isSizeImage
            ? (
                <div className="grid gap-4">
                  {image?.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`banner-${idx}`}
                      className="w-full h-full object-cover rounded-xl"
                      onError={e => (e.currentTarget.src = '/images/no-image.png')}
                    />
                  ))}
                </div>
              )
            : (
                <div className="flex gap-2 overflow-hidden rounded-xl">
                  {image?.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`thumbnail-${idx}`}
                      className="object-cover h-full flex-1 rounded-md"
                      onError={e => (e.currentTarget.src = '/images/no-image.png')}
                    />
                  ))}
                </div>
              )}
        </div>
      )}

      {image?.length === 0
        && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {news?.slice(0, max).map(el => (
              <div
                key={el.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative">
                  <Link href={`/news/${el.id}`}>
                    <img
                      src={process.env.NEXT_PUBLIC_SERVER_URL_IMAGE + el.images?.[0]?.fileUrl || '/images/no-image.png'}
                      alt={el.title}
                      className="w-full h-[220px] object-cover transition-transform duration-300 hover:scale-[1.02]"
                      onError={e => (e.currentTarget.src = '/images/no-image.png')}
                    />
                  </Link>

                  {/* Date Tag */}
                  <div className="absolute top-3 right-3 bg-white/90 text-center text-sm px-2 py-1 rounded-lg shadow">
                    <div className="font-bold">{new Date(el.publishDate).getDate()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(el.publishDate).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <Link href={`/news/${el.id}`}>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:underline">
                      {currentLanguage === 'en'
                        ? el.titleEnglish
                        : currentLanguage === 'ko'
                          ? el.titleKorean
                          : el.title}
                    </h3>
                  </Link>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <i className="pi pi-user text-gray-400" />
                    <span>{el.author || 'Admin'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Load More */}
      {news?.length > max && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm shadow-sm"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
