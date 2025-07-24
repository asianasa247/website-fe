// services/.service.ts

import api from './api';

export const getIntroduceLists = async () => {
  const response = await api.get(`/Introduce/list`);
  return response.data.data;
};

export const getIntroduceDetail = async (id: any) => {
  const response = await api.get(`/Introduce/${id}`);
  return response.data;
};
