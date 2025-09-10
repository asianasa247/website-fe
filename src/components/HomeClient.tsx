'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/context/theme-provider';
import NewsSection from './NewsCard';
import ProductZone from './ProductCard';

type Props = {
  webCategories: any[];
  allProducts?: any[];
  uncategorizedProducts?: any[];
};

export default function HomeClient({ webCategories, allProducts = [], uncategorizedProducts }: Props) {
  const [categories] = useState(webCategories);
  const theme = useTheme();
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

  const computedUncategorized = useMemo(() => {
    if (uncategorizedProducts?.length) {
      return uncategorizedProducts;
    }
    if (!allProducts?.length) {
      return [];
    }
    const idsInCategories = new Set<number>(
      categories.flatMap(cat => (cat?.products || []).map((p: any) => Number(p.id))),
    );
    return allProducts.filter((p: any) => !idsInCategories.has(Number(p.id)));
  }, [uncategorizedProducts, allProducts, categories]);

  return (
    <div className="space-y-12 px-1 md:px-8 lg:px-16">
      {computedUncategorized.length > 0 && (
        <div
          className="  md:p-8 transition-all duration-300"
        >
          {/* Header danh mục mặc định */}
          <div className="flex items-center justify-center mb-4" style={{ color: theme.textColor }}>
            <h2 className="text-xl md:text-2xl font-bold ">
              Sản phẩm mới
            </h2>
          </div>
          <ProductZone
            products={computedUncategorized}
            imageUrls={[]}
            isSizeImage={false}
            unit="VNĐ"
            isShowFavourite={true}
          />
        </div>
      )}

      {categories.map(cat => (
        <div
          key={cat.id}
          className="  md:p-8 transition-all duration-300"
        >
          {/* Header danh mục */}
          <div className="flex items-center justify-center mb-4" style={{ color: theme.textColor }}>
            <h2 className="text-xl md:text-2xl font-bold ">
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
