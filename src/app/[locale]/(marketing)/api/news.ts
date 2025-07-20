// services/news.service.ts

import api from './api';

type ListParams = any;

export const getNewsList = async (params: ListParams) => {
  const response = await api.get(`/WebNews`, { params });
  return response.data;
};

export const getNewsHeadline = async (params: ListParams) => {
  const response = await api.get(`/WebNews/getnewheadline`, { params });
  return response.data;
};

export const getNewsDetail = async (id: number) => {
  const response = await api.get(`/WebNews/${id}`);
  return response.data;
};
