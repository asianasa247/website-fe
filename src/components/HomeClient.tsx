'use client';

import { useEffect, useState } from 'react';
import NewsSection from './NewsCard';
import ProductZone from './ProductCard';

type Props = {
  webCategories: any[];
};

export default function HomeClient({ webCategories }: Props) {
  const [categories] = useState(webCategories);

  useEffect(() => {
  }, []);

  function parseImageUrls(imageString: string): string[] {
    try {
      const list = JSON.parse(imageString.replace(/\\\\/g, '/'));
      return list.map((img: any) => `${process.env.NEXT_PUBLIC_SERVER_URL_IMAGE}${img.FileName}`);
    } catch {
      return [];
    }
  }

  return (
    <div className="space-y-12 px-4 md:px-8 lg:px-16">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="  md:p-8 transition-all duration-300"
        >
          {/* Header danh mục */}
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {cat.label}
            </h2>
          </div>

          {/* Hiển thị sản phẩm */}
          {cat.isProduct && cat.products?.length > 0 && (
            <ProductZone
              products={cat.products}
              imageUrls={cat.imageUrls || []}
              isSizeImage={cat.isSizeImage || false}
              unit="VNĐ"
              image={parseImageUrls(cat?.image)}
              isShowFavourite={true}
            />
          )}

          {/* Hiển thị tin tức */}
          {((!cat.isProduct && cat.news?.length > 0) || (cat?.image)) && (
            <NewsSection
              news={cat.news}
              categoryImages={cat.imageUrls || []}
              image={parseImageUrls(cat?.image)}
              isSizeImage={cat.isSizeImage || false}
              currentLanguage="vi"
            />
          )}
        </div>
      ))}
    </div>
  );
}
