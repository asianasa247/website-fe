// services/.service.ts

import api from './api';

type ListParams = any;

export const getList = async (params: ListParams) => {
  const response = await api.get(`/WebCareer`, { params });
  return response.data;
};

export const getDetail = async (id: number) => {
  const response = await api.get(`/WebCareer/${id}`);
  return response.data;
};
