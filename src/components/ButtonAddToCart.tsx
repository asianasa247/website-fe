'use client';

import { useCart } from '@/context/cart-context';

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Thêm vào giỏ
    </button>
  );
}
