// services/news.service.ts

import axios from 'axios';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'https://your-api.com'}/WebNews`;

type ListParams = any;

export const getNewsList = async (params: ListParams) => {
  const response = await axios.get(API_BASE, { params });
  return response.data;
};

export const getNewsHeadline = async (params: ListParams) => {
  const response = await axios.get(`${API_BASE}/getnewheadline`, { params });
  return response.data;
};

export const getNewsDetail = async (id: number) => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};
