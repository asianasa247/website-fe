import api from './api';

type OrderData = {
  totalPrice: number;
  totalPriceDiscount: number;
  totalPricePaid: number;
  fullName: string;
  isPayment: boolean;
  paymentAt: string;
  fromAt: string;
  toAt: string;
  email: string;
  phoneNumber: string;
  paymentMethod: string;
  shippingAddress: string;
  date: string;
  promotion: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  goods: Array<{
    goodId: string;
    quantity: number;
    price: number;
  }>;
};

// Create order
export const createOrder = async (data: OrderData) => {
  const response = await api.post(`/WebOrder/createOrder`, data);
  return response.data;
};

// Get provinces
export const getProvinces = async () => {
  const response = await api.get(`/WebAddress/getProvince`);
  return response.data;
};

// Get districts by province
export const getDistricts = async (provinceId: string) => {
  const response = await api.get(`/WebAddress/getDistrict/${provinceId}`);
  return response.data;
};

// Get wards by district
export const getWards = async (districtId: string) => {
  const response = await api.get(`/WebAddress/getWard/${districtId}`);
  return response.data;
};

// Subscribe to mailing list
export const subscribeMail = async (email: string, phoneNumber: string, note: string) => {
  const response = await api.post(`/WebMails/?email=${email}&phoneNumber=${phoneNumber}&note=${note}`);
  return response.data;
};
