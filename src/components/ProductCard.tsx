/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-array-index-key */
'use client';

import Link from 'next/link';
import { useState } from 'react';

type Product = {
  id: number;
  image1: string;
  webGoodNameVietNam?: string;
  titleVietNam?: string;
  detail1?: string;
  detail2?: string;
  webPriceVietNam?: number;
  discount?: number;
  heart?: boolean;
};

type Props = {
  products: Product[];
  isSizeImage: boolean;
  imageUrls: string[];
  unit: string;
  isShowFavourite?: boolean;
  image?: any;
};

export default function ProductZone({
  products,
  isSizeImage,
  imageUrls,
  unit,
  isShowFavourite = true,
}: Props) {
  const [page, setPage] = useState(1);
  const rows = 4;
  const selectProducts = products?.slice(0, page * rows);

  const formatCurrency = (money: number) =>
    money.toLocaleString('vi-VN');

  const getDiscountedPrice = (product: Product) => {
    const price = product.webPriceVietNam || 0;
    const discount = product.discount || 0;
    return price - (price * discount) / 100;
  };

  return (
    <div className="space-y-6">
      {/* Banners */}
      {imageUrls?.length > 0 && (
        isSizeImage
          ? (
              <div className="space-y-4">
                {imageUrls.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="banner"
                    className="w-full h-[400px] object-cover rounded-xl"
                    onError={e => (e.currentTarget.src = '/images/no-image.png')}
                  />
                ))}
              </div>
            )
          : (
              <div className="flex gap-2 overflow-hidden rounded-xl">
                {imageUrls.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumbnail"
                    className="h-[280px] flex-1 object-cover rounded-md"
                    onError={e => (e.currentTarget.src = '/images/no-image.png')}
                  />
                ))}
              </div>
            )
      )}

      {/* Product Cards */}
      <div className={`grid ${selectProducts?.length === 1 ? '' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
        {selectProducts?.map(product => (
          <div
            key={product.id}
            className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col"
          >
            {/* Discount badge */}
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -
                {product.discount}
                %
              </div>
            )}

            {/* Heart icon */}
            {isShowFavourite && (
              <div
                className={`absolute top-2 right-2 cursor-pointer ${
                  product.heart ? 'text-red-500' : 'text-gray-300'
                }`}
              >
                <i className="pi pi-heart" />
              </div>
            )}

            {/* Image */}
            <Link href={`/products/${product.id}`}>
              <img
                src={process.env.NEXT_PUBLIC_SERVER_URL_IMAGE + product.image1}
                alt={product.webGoodNameVietNam || 'product'}
                className="w-full h-48 object-cover rounded mb-3 transition-transform hover:scale-[1.02]"
                onError={e => (e.currentTarget.src = '/images/no-image.png')}
              />
            </Link>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                  <Link href={`/products/${product.id}`}>
                    {product.webGoodNameVietNam}
                  </Link>
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {product.detail2 || product.detail1}
                </p>
                {product.titleVietNam && (
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                    {product.titleVietNam}
                  </p>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <div className="text-sm font-bold text-orange-600">
                  {formatCurrency(getDiscountedPrice(product))}
                  {' '}
                  {unit}
                </div>
                {product.discount && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatCurrency(product.webPriceVietNam || 0)}
                    {' '}
                    {unit}
                  </div>
                )}
              </div>

              <button type="button" className="mt-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-full transition-all">
                <i className="pi pi-shopping-cart" />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {products?.length > selectProducts?.length && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setPage(prev => prev + 1)}
            className="px-5 py-2 text-sm rounded-full text-orange-600 border border-orange-500 hover:bg-orange-50 transition"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
