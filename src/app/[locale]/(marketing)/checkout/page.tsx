/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Toast } from '@/components/Toast';
import { useCart } from '@/context/cart-context';
import { addressApi } from '../api/address';
import { createOrder } from '../api/oder';

type AddressData = {
  id: string;
  name: string;
  code: string;
};

function formatVND(n: number) {
  return `${n.toLocaleString('vi-VN')}đ`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cart, dispatch } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Address states
  const [provinces, setProvinces] = useState<AddressData[]>([]);
  const [districts, setDistricts] = useState<AddressData[]>([]);
  const [wards, setWards] = useState<AddressData[]>([]);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    provinceId: '',
    districtId: '',
    wardId: '',
    note: '',
    payment: 'cod' as 'card' | 'cod',
    promotion: '',
  });

  // Load initial address data
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await addressApi.getProvinces();
        setProvinces(data.data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
        setError('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!form.provinceId) {
      return;
    }

    const loadDistricts = async () => {
      try {
        const data = await addressApi.getDistricts(form.provinceId);
        setDistricts(data.data);
        setForm(prev => ({ ...prev, districtId: '', wardId: '' }));
      } catch (error) {
        console.error('Failed to load districts:', error);
      }
    };
    loadDistricts();
  }, [form.provinceId]);

  // Load wards when district changes
  useEffect(() => {
    if (!form.districtId) {
      return;
    }

    const loadWards = async () => {
      try {
        const data = await addressApi.getWards(form.districtId);
        setWards(data.data);
        setForm(prev => ({ ...prev, wardId: '' }));
      } catch (error) {
        console.error('Failed to load wards:', error);
      }
    };
    loadWards();
  }, [form.districtId]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/');
    }
  }, [cart.items.length, router]);

  const subtotal = cart.total;
  const shippingFee = subtotal > 2_000_000 ? 0 : 30_000;
  const total = subtotal + shippingFee;

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function buildShippingAddress(): string {
    const parts = [
      form.address,
      wards.find(w => w.id === form.wardId)?.name,
      districts.find(d => d.id === form.districtId)?.name,
      provinces.find(p => p.id === form.provinceId)?.name,
    ].filter(Boolean);

    return parts.join(', ');
  }

  const isFormValid = () => {
    return (
      form.name
      && form.phone
      && form.address
      && form.provinceId
      && form.districtId
      && form.wardId
    );
  };

  async function onPay() {
    if (!isFormValid()) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        totalPrice: total,
        totalPriceDiscount: 0,
        totalPricePaid: total,
        fullName: form.name,
        isPayment: true,
        paymentAt: new Date().toISOString(),
        fromAt: new Date().toISOString(),
        toAt: new Date().toISOString(),
        email: form.email || 'guest@example.com',
        phoneNumber: form.phone,
        paymentMethod: form.payment,
        shippingAddress: buildShippingAddress(),
        date: new Date().toISOString(),
        promotion: form.promotion,
        provinceId: form.provinceId,
        districtId: form.districtId,
        wardId: form.wardId,
        goods: cart.items.map(item => ({
          goodId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await createOrder(orderData);
      dispatch({ type: 'CLEAR_CART' });
      setShowToast(true);
      router.push('/checkout/success');
    } catch (error) {
      console.error('Payment failed:', error);
      setError('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Thông tin giao hàng</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Information */}
              <label className="block">
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Họ và tên *"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>

              <label className="block">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Số điện thoại *"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>

              <label className="block sm:col-span-2">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Email (không bắt buộc)"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                />
              </label>

              {/* Address Selection */}
              <div className="sm:col-span-2 space-y-4">
                <select
                  name="provinceId"
                  value={form.provinceId}
                  onChange={onChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  required
                >
                  <option value="">Chọn tỉnh/thành phố *</option>
                  {provinces?.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>

                <select
                  name="districtId"
                  value={form.districtId}
                  onChange={onChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  disabled={!form.provinceId}
                  required
                >
                  <option value="">Chọn quận/huyện *</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>

                <select
                  name="wardId"
                  value={form.wardId}
                  onChange={onChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  disabled={!form.districtId}
                  required
                >
                  <option value="">Chọn phường/xã *</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>

                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder="Địa chỉ cụ thể (số nhà, đường) *"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  required
                />

                <textarea
                  name="note"
                  value={form.note}
                  onChange={onChange}
                  placeholder="Ghi chú (không bắt buộc)"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-200"
                  rows={3}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Phương thức thanh toán</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.payment === 'cod'}
                    onChange={() => setForm(p => ({ ...p, payment: 'cod' }))}
                    className="text-green-600"
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-2 p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={form.payment === 'card'}
                    onChange={() => setForm(p => ({ ...p, payment: 'card' }))}
                    className="text-green-600"
                  />
                  <span>Thanh toán qua thẻ/ví điện tử</span>
                </label>
              </div>
            </div>

            {/* Promotion Code */}
            <div className="mt-6">
              <label className="text-sm text-slate-600 block">Mã giảm giá</label>
              <div className="flex gap-2 mt-2">
                <input
                  name="promotion"
                  value={form.promotion}
                  onChange={onChange}
                  className="flex-1 p-3 border rounded-md"
                  placeholder="Nhập mã giảm giá"
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </section>

          {/* Cart Summary */}
          <aside className="bg-white rounded-lg shadow p-6 md:sticky md:top-6 h-fit">
            <h3 className="text-lg font-medium mb-4">Tóm tắt đơn hàng</h3>

            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="text-sm text-gray-500">
                      {item.quantity}
                      {' '}
                      x
                      {formatVND(item.price)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatVND(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Tổng cộng</span>
                <span className="text-green-600">{formatVND(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onPay}
              disabled={loading || !isFormValid()}
              className="w-full mt-6 py-4 bg-green-600 text-white font-medium rounded-md
                hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading
                ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Đang xử lý...</span>
                    </>
                  )
                : (
                    'Đặt hàng'
                  )}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
            </p>
          </aside>
        </div>
      </div>

      {showToast && (
        <Toast
          message="Đặt hàng thành công!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </main>
  );
}
