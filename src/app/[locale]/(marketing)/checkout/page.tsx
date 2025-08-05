/* eslint-disable jsx-a11y/label-has-associated-control */
// app/checkout/page.tsx
'use client';

import React, { useMemo, useState } from 'react';

type CartItem = { id: number; name: string; qty: number; price: number };

const sampleCart: CartItem[] = [
  { id: 1, name: 'Tour A', qty: 1, price: 1_200_000 },
  { id: 2, name: 'Tour B', qty: 2, price: 450_000 },
];

function formatVND(n: number) {
  return `${n.toLocaleString('vi-VN')} ₫`;
}

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    note: '',
    payment: 'card' as 'card' | 'cod',
  });
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => sampleCart.reduce((s, i) => s + i.price * i.qty, 0), []);
  const shippingFee = subtotal > 2_000_000 ? 0 : 30_000;
  const total = subtotal + shippingFee;

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  function onPay() {
    if (!form.name || !form.phone || !form.address) {
      return;
    }
    setLoading(true);
    // demo: simulate API
    setTimeout(() => {
      setLoading(false);
    }, 1100);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Thanh toán</h1>
          <nav className="text-sm text-slate-500 hidden sm:block">Home / Giỏ hàng / Thanh toán</nav>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
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

          {/* Summary */}
          <aside className="bg-white rounded-lg shadow p-6 md:sticky md:top-6">
            <h3 className="text-lg font-medium mb-3">Tóm tắt đơn hàng</h3>

            <div className="space-y-3">
              {sampleCart.map(it => (
                <div key={it.id} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-slate-500">
                      Số lượng:
                      {it.qty}
                    </div>
                  </div>
                  <div className="font-semibold">{formatVND(it.price * it.qty)}</div>
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
              disabled={loading}
              className="w-full mt-5 py-3 bg-indigo-600 text-white font-medium rounded-md shadow hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán'}
            </button>

            <p className="text-xs text-slate-500 mt-3">
              Bảo mật & mã hóa thông tin thanh toán — demo.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
