import api from './api';

export type OrderData = {
  totalPrice: number;
  totalPriceDiscount: number;
  totalPricePaid: number;
  fullName: string;
  isPayment: boolean;
  paymentAt: string; // ISO
  fromAt: string; // ISO
  toAt: string; // ISO
  email?: string; // optional
  phoneNumber: string;
  paymentMethod: string;
  shippingAddress: string;
  date: string; // ISO
  promotion: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  goods: Array<{ goodId: string; quantity: number; price: number }>;
};

const toInt = (v?: string) => {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  const n = Number(v);

  return Number.isNaN(n) ? null : Math.trunc(n);
};

// Map đúng y hệt OrderViewModel (PascalCase, KHÔNG gửi field addresses nữa)
function toBackendPayload(d: OrderData) {
  return {
    TotalPrice: d.totalPrice,
    TotalPriceDiscount: d.totalPriceDiscount,
    TotalPricePaid: d.totalPricePaid,

    // DTO có cả Tell và PhoneNumber; Tell mình map = phoneNumber (nếu BE dùng)
    Tell: d.phoneNumber,
    FullName: d.fullName,

    IsPayment: d.isPayment,
    PaymentAt: d.paymentAt,
    FromAt: d.fromAt,
    ToAt: d.toAt,

    Broker: null, // không có trên FE
    ProvinceId: toInt(d.provinceId),
    WardId: toInt(d.wardId),
    DistrictId: toInt(d.districtId),
    Identifier: null, // không có trên FE

    ShippingAddress: d.shippingAddress,
    // Nếu bạn muốn gửi email khi user nhập, để nguyên:
    Email: d.email ?? null,
    PhoneNumber: d.phoneNumber,
    PaymentMethod: d.paymentMethod,
    Date: d.date,
    Promotion: d.promotion,

    Goods: d.goods.map(g => ({
      GoodId: toInt(g.goodId) ?? 0,
      Quantity: g.quantity,
      Price: g.price,
      AdultQuantity: null,
      ChildrenQuantity: null,
    })),
  };
}

export const createOrder = async (data: OrderData) => {
  const payload = toBackendPayload(data);
  // Xem payload thực tế để đối chiếu khi cần
  // eslint-disable-next-line no-console
  console.log('createOrder payload >>>', payload);

  const res = await api.post('/WebOrder/createOrder', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

// Address API (giữ nguyên cách dùng ở page.tsx)
export type AddressData = {
  id: string;
  name: string;
  code: string;
};

const getProvinces = async () => {
  const response = await api.get('/WebAddress/getProvince');
  return response.data;
};

const getDistricts = async (provinceId: string) => {
  const response = await api.get(`/WebAddress/getDistrict/${provinceId}`);
  return response.data;
};

const getWards = async (districtId: string) => {
  const response = await api.get(`/WebAddress/getWard/${districtId}`);
  return response.data;
};

const subscribeMail = async (
  email: string,
  phoneNumber: string,
  note: string,
) => {
  const response = await api.post(
    `/WebMails/?email=${email}&phoneNumber=${phoneNumber}&note=${note}`,
  );
  return response.data;
};

export const addressApi = {
  getProvinces,
  getDistricts,
  getWards,
};

export const mailApi = {
  subscribeMail,
};
