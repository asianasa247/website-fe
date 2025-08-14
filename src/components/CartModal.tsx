/* eslint-disable style/multiline-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TbXboxX } from 'react-icons/tb';
import { useCart } from '@/context/cart-context';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const handleCheckout = () => {
    onClose(); // Close modal first
    router.push('/checkout'); // Navigate to checkout page
  };
  if (!isOpen) {
    return null;
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity },
    });
  };

  const removeItem = (id: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />

      <div className="relative min-h-screen md:flex md:items-center md:justify-center">
        <div className="relative bg-white w-full max-w-lg mx-auto rounded-lg shadow-lg p-6 md:m-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Giỏ hàng</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <TbXboxX className="text-green-600" />
            </button>
          </div>

          {/* Cart Items */}
          {state.items.length === 0 ? (
            <div className="text-center py-8">
              <i className="pi pi-shopping-cart text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Product Image */}
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.image || '/images/no-image.png'}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-orange-600 font-bold mt-1">
                      {item.price.toLocaleString('vi-VN')}
                      đ
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        <i className="pi pi-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Tổng tiền:</span>
                  <span className="text-xl font-bold text-orange-600">
                    {state.total.toLocaleString('vi-VN')}
                    đ
                  </span>
                </div>

                {/* Checkout Button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Tiếp tục mua sắm
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
