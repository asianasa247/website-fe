/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-array-index-key */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useTheme } from '@/context/theme-provider';
import { Toast } from './Toast';

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
  const theme = useTheme();
  const formatCurrency = (money: number) => money.toLocaleString('vi-VN');

  const getDiscountedPrice = (product: Product) => {
    const price = product.webPriceVietNam || 0;
    const discount = product.discount || 0;
    return price - (price * discount) / 100;
  };
  const [showToast, setShowToast] = useState(false);
  const { dispatch } = useCart();
  const handleAddToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id.toString(),
        name: product.webGoodNameVietNam || '',
        price: getDiscountedPrice(product),
        quantity: 1,
        image: process.env.NEXT_PUBLIC_SERVER_URL_IMAGE + product.image1,
      },
    });
  };
  return (
    <div className="space-y-8 container mx-auto px-0 md:px-8 lg:px-16">
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
                    className="w-full h-[400px] object-cover rounded-2xl shadow-md"
                    onError={e => (e.currentTarget.src = '/images/no-image.png')}
                  />
                ))}
              </div>
            )
          : (
              <div className="flex gap-3 overflow-hidden rounded-2xl">
                {imageUrls.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumbnail"
                    className="h-[280px] flex-1 object-cover rounded-xl shadow"
                    onError={e => (e.currentTarget.src = '/images/no-image.png')}
                  />
                ))}
              </div>
            )
      )}

      {/* Product Cards */}
      <div
        className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] justify-center gap-4"
      >
        {selectProducts?.map(product => (
          <div
            key={product.id}
            className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-2 flex flex-col max-w-[300px] w-full mx-auto"
          >
            {/* Discount badge */}
            {product.discount && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                -
                {product.discount}
                %
              </div>
            )}

            {/* Heart icon */}
            {isShowFavourite && (
              <div
                className={`absolute top-3 right-3 cursor-pointer text-lg ${
                  product.heart ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                }`}
              >
                <i className="pi pi-heart" />
              </div>
            )}

            {/* Image */}
            <Link href={`/products/${product.id}`}>
              <div className="overflow-hidden rounded-xl mb-3">
                <img
                  src={process.env.NEXT_PUBLIC_SERVER_URL_IMAGE + product.image1}
                  alt={product.webGoodNameVietNam || 'product'}
                  className="w-full h-56 object-cover transform transition-transform duration-500 hover:scale-105"
                  onError={e => (e.currentTarget.src = '/images/no-image.png')}
                />
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm  line-clamp-2 mb-1  transition" style={{ color: theme.textColor }}>
                  <Link href={`/products/${product.id}`}>
                    {product.webGoodNameVietNam}
                  </Link>
                </h3>
                <p className="text-xs  line-clamp-1" style={{ color: theme.textColorSecondary }}>
                  {product.detail2 || product.detail1}
                </p>
                {product.titleVietNam && (
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                    {product.titleVietNam}
                  </p>
                )}
              </div>

              {/* Giá */}
              <div className="mt-3 space-y-1">
                <div className="text-base font-bold " style={{ color: theme.textColor }}>
                  {formatCurrency(getDiscountedPrice(product))}
                  {' '}
                  {unit}
                </div>
                {product.discount && (
                  <div className="text-xs  line-through" style={{ color: theme.textColor }}>
                    {formatCurrency(product.webPriceVietNam || 0)}
                    {' '}
                    {unit}
                  </div>
                )}
              </div>

              {/* Button đẹp trên mobile */}
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className="mt-4 w-full flex items-center justify-center gap-2
      bg-gradient-to-r

      active:scale-95
    text-sm font-medium
      py-3 rounded-full
      transition-all shadow-md"
                style={{ color: theme.textColor, border: theme.primaryColor }}
              >
                <i className="pi pi-shopping-cart text-base" />
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
            className="px-6 py-2 text-sm rounded-full text-orange-600 border border-orange-500 hover:bg-orange-50 hover:shadow transition"
          >
            Xem thêm
          </button>
        </div>
      )}
      {showToast && (
        <Toast
          message="Đã thêm sản phẩm vào giỏ hàng"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
