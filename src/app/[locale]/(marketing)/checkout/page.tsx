/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useCart } from '@/context/cart-context';

function formatVND(n: number) {
  return `${n.toLocaleString('vi-VN')}đ`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cart } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
    payment: 'card' as 'card' | 'cod',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/');
    }
  }, [cart.items.length, router]);

  const subtotal = cart.total;
  const shippingFee = subtotal > 2_000_000 ? 0 : 30_000;
  const total = subtotal + shippingFee;

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  async function onPay() {
    if (!form.name || !form.phone || !form.address) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement your payment API here
      // const order = {
      //   items: cart.items,
      //   total,
      //   shippingFee,
      //   shipping: {
      //     name: form.name,
      //     phone: form.phone,
      //     address: form.address,
      //     city: form.city,
      //     note: form.note,
      //   },
      //   payment: form.payment,
      // };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Handle successful payment
      router.push('/checkout/success');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ...existing header... */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form section stays the same */}
          <section className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <section className="md:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Thông tin giao hàng</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Họ và tên"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="block">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Số điện thoại"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="Tỉnh / Thành phố"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Địa chỉ cụ thể (số nhà, đường, phường)"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={onChange}
                    placeholder="Ghi chú (không bắt buộc)"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-200"
                    rows={3}
                  />
                </label>
              </div>

              <hr className="my-6" />

              <h3 className="text-lg font-medium mb-3">Phương thức thanh toán</h3>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={form.payment === 'card'}
                    onChange={() => setForm(p => ({ ...p, payment: 'card' }))}
                  />
                  <span className="ml-2">Thẻ / Gateway</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.payment === 'cod'}
                    onChange={() => setForm(p => ({ ...p, payment: 'cod' }))}
                  />
                  <span className="ml-2">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>

              <div className="mt-6">
                <label className="text-sm text-slate-600 block">Mã giảm giá</label>
                <div className="flex gap-2 mt-2">
                  <input className="flex-1 p-2 border rounded-md" placeholder="Nhập mã giảm giá" />
                  <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Áp dụng</button>
                </div>
              </div>
            </section>
          </section>

          {/* Updated Cart Summary */}
          <aside className="bg-white rounded-lg shadow p-6 md:sticky md:top-6">
            <h3 className="text-lg font-medium mb-3">Tóm tắt đơn hàng</h3>

            <div className="space-y-3">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-slate-500">
                      Số lượng:
                      {' '}
                      {item.quantity}
                      {' '}
                      x
                      {' '}
                      {formatVND(item.price)}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatVND(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <div>Tạm tính</div>
                <div>{formatVND(subtotal)}</div>
              </div>
              <div className="flex justify-between">
                <div>Phí vận chuyển</div>
                <div>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</div>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2">
                <div>TỔNG</div>
                <div>{formatVND(total)}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onPay}
              disabled={loading || cart.items.length === 0}
              className="w-full mt-5 py-3 bg-green-600 text-white font-medium rounded-md
                shadow hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors duration-200"
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán'}
            </button>

            <p className="text-xs text-slate-500 mt-3 text-center">
              Bảo mật & mã hóa thông tin thanh toán
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
