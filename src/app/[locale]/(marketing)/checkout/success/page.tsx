'use client';

import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full mx-auto p-8 rounded-lg shadow-lg text-center">
        <div className="text-green-500 mb-4">
          <FaCheckCircle className="w-16 h-16 mx-auto" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Đặt hàng thành công!
        </h1>

        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng. Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng.
        </p>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Mã đơn hàng của bạn
            </p>
            <p className="text-lg font-medium text-green-600">
              #
              {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>

          <Link
            href="orders"
            className="block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xem đơn hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
