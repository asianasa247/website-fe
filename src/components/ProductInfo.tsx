import React from 'react';
import QuantitySelector from '@/components/QuantitySelector';

export default function ProductInfo({
  product,
  imageUrl,
  images,
  currentIndex,
  quantity,
  setQuantity,
  category,
}: any) {
  const calPrice = (price: number, discount: number) => price - price * (discount || 0) / 100;

  const displayPrice = calPrice(product.price, product.discount);
  const currencyUnit = 'VNĐ';

  return (
    <div className="w-full md:w-3/5 p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

      <div className="mb-4">
        {product.discount > 0 && (
          <span className="text-gray-500 line-through mr-3">
            {product.price.toLocaleString('vi-VN')}
            {' '}
            {currencyUnit}
          </span>
        )}
        <span className="text-2xl font-bold">
          {displayPrice.toLocaleString('vi-VN')}
          {' '}
          {currencyUnit}
        </span>
      </div>

      <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

      <button className="w-full py-3 bg-orange-500 text-white rounded-lg mb-6 hover:bg-orange-600 transition">
        🛒
        {' '}
      </button>

      <div className="text-gray-700 text-lg">
        <h3 className="font-bold mb-4 text-2xl underline">Mô tả</h3>
        <p>{product.description}</p>
        <div className="mt-4">
          <div>
            <strong>

              :
            </strong>
            {' '}
            {category.name}
          </div>
          <div>
            <strong>
              :
            </strong>
            {' '}
            {product.stockUnit}
          </div>
        </div>
      </div>
    </div>
  );
}
