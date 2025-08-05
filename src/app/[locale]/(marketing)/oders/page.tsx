/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// app/orders/page.tsx
'use client';

import React, { useMemo, useState } from 'react';

type OrderItem = { name: string; qty: number };
type Shipping = {
  company: string;
  tracking: string;
  history: { time: string; note: string }[];
  receiver: { name: string; phone: string };
};
type Order = {
  id: string;
  date: string;
  total: number;
  status: 'Pending' | 'Shipping' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  shipping: Shipping;
};

const sampleOrders: Order[] = [
  {
    id: 'OD20250801-001',
    date: '2025-08-01',
    total: 1_200_000,
    status: 'Shipping',
    items: [{ name: 'Tour A', qty: 1 }],
    shipping: {
      company: 'GHTK',
      tracking: 'GHTK123456789',
      history: [
        { time: '2025-08-02 10:30', note: 'Đã lấy hàng' },
        { time: '2025-08-03 08:20', note: 'Đang vận chuyển' },
      ],
      receiver: { name: 'Nguyễn Văn A', phone: '0987654321' },
    },
  },
  {
    id: 'OD20250725-004',
    date: '2025-07-25',
    total: 450_000,
    status: 'Delivered',
    items: [{ name: 'Tour B', qty: 2 }],
    shipping: {
      company: 'VNPost',
      tracking: 'VN987654321',
      history: [{ time: '2025-07-26 14:00', note: 'Giao thành công' }],
      receiver: { name: 'Trần Thị B', phone: '0912345678' },
    },
  },
];

function formatVND(n: number) {
  return `${n.toLocaleString('vi-VN')} ₫`;
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>(sampleOrders);
  const [filter, setFilter] = useState<'All' | Order['status']>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (filter !== 'All' && o.status !== filter) {
          return false;
        }
        if (query && !o.id.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
        return true;
      }),
    [orders, filter, query],
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Danh sách đơn hàng</h1>
          <div className="text-sm text-slate-500">Quản lý đơn & theo dõi vận chuyển</div>
        </header>

        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-4">
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-sm">Filter:</label>
            {(['All', 'Pending', 'Shipping', 'Delivered', 'Cancelled'] as const).map(f => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-white border'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <input
              placeholder="Tìm theo mã đơn..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(o => (
            <article
              key={o.id}
              className="bg-white rounded-md shadow p-4 flex flex-col md:flex-row md:items-center justify-between"
            >
              <div>
                <div className="font-medium text-sm md:text-base">{o.id}</div>
                <div className="text-slate-500 text-xs md:text-sm">
                  {o.date}
                  {' '}
                  •
                  {o.items.length}
                  {' '}
                  sản phẩm
                </div>
              </div>

              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold">{formatVND(o.total)}</div>
                  <div className="text-sm text-slate-500">{o.status}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(o)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md"
                >
                  Xem vận chuyển
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-500">Không có đơn hàng phù hợp</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">
                  Vận chuyển —
                  {selected.id}
                </h3>
                <div className="text-sm text-slate-500">
                  {selected.shipping.company}
                  {' '}
                  • Tracking:
                  {selected.shipping.tracking}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng"
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Người nhận</h4>
                <div className="text-sm text-slate-600">{selected.shipping.receiver.name}</div>
                <div className="text-sm text-slate-600">{selected.shipping.receiver.phone}</div>

                <h4 className="font-medium mt-4">Lịch sử vận chuyển</h4>
                <ul className="mt-2 space-y-2">
                  {selected.shipping.history.map((h, idx) => (
                    <li key={idx} className="text-sm">
                      <div className="font-medium">{h.time}</div>
                      <div className="text-slate-600">{h.note}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Chi tiết đơn</h4>
                <ul className="mt-2 text-sm space-y-2">
                  {selected.items.map((it, idx) => (
                    <li key={idx}>
                      {it.name}
                      {' '}
                      ×
                      {it.qty}
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <a
                    className="inline-block mt-2 text-sm underline"
                    href={`https://tracking.example.com/${selected.shipping.tracking}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở trang tracking nhà vận chuyển
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 border rounded-md">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
