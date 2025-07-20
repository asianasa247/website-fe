// services/productService.ts

import api from './api';

export const getProductList = async (params: { Page: number; PageSize: number; Type: number }) => {
  const response = await api.get(`/WebProduct/getById`, { params });
  return response.data;
};

export const getProductDetail = async (id: any) => {
  const response = await api.get(`/WebProduct/getById/${id}`);
  return response.data;
};

export const getProductPagging = async (
  pageNum: number = 0,
  pageSize: number = 10,
  q: string = '',
) => {
  let url = `/WebProduct/get-products-pagging?pageNum=${pageNum}&pageSize=${pageSize}`;
  if (q !== '') {
    url += `&q=${q}`;
  }
  const response = await api.get(url);
  return response.data;
};
