// services/.service.ts

import api from './api';

type ListParams = any;

export const getEventList = async (params: ListParams) => {
  const response = await api.get(`/EventWithImages`, { params });
  return response.data;
};
