'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductImages from '@/components/ProductImages';
import ProductInfo from '@/components/ProductInfo';
import { getProductDetail } from '../../api/productService';

const ProductDetailClient = () => {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchData = async () => {
      try {
        const res = await getProductDetail(id);

        setProduct(res.data.good);
        setCategory(res.data.category);
      } catch (err) {
        console.error('Failed to fetch product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu sản phẩm...</div>;
  }
  if (!product) {
    return <div className="text-center py-10">Không tìm thấy sản phẩm</div>;
  }

  const images = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
    product.image5,
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-6 bg-white">
      <div className="flex flex-col md:flex-row gap-6">
        <ProductImages
          images={images}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
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

      <div className="related-products mt-16">
        <h2 className="text-3xl font-medium text-center mb-10">
          Sản phẩm liên quan
        </h2>
        <div className="content-product-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        </div>
      </div>
    </div>
  );
};

export default ProductDetailClient;
