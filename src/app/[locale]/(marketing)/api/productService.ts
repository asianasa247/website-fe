// services/productService.ts

import api from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getProductList = async (params: { Page: number; PageSize: number; Type: number }) => {
  const response = await api.get(`${API_BASE_URL}/WebProduct/getById`, { params });
  return response.data;
};

export const getProductDetail = async (id: any) => {
  const response = await api.get(`${API_BASE_URL}/WebProduct/getById/${id}`);
  return response.data;
};

export const getProductPagging = async (
  pageNum: number = 0,
  pageSize: number = 10,
  q: string = '',
) => {
  let url = `${API_BASE_URL}/WebProduct/get-products-pagging?pageNum=${pageNum}&pageSize=${pageSize}`;
  if (q !== '') {
    url += `&q=${q}`;
  }
  const response = await api.get(url);
  return response.data;
};
