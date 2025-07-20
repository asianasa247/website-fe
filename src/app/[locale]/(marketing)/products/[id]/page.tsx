// components/ProductDetailClient.tsx
'use client';

import { useState } from 'react';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';

type Props = {
  product: any;
  category: any;
};

const ProductDetailClient = ({ product, category }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = [product.image1, product.image2, product.image3, product.image4, product.image5].filter(Boolean);
  const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  return (
    <div className="container mx-auto px-4 py-6 bg-white">
      <div className="flex flex-col md:flex-row gap-6">
        <ProductImages images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        <ProductInfo
          product={product}
          imageUrl={imageUrl}
          images={images}
          currentIndex={currentIndex}
          quantity={quantity}
          setQuantity={setQuantity}
          category={category}
        />
      </div>
    </div>
  );
};

export default ProductDetailClient;
