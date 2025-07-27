// src/services/introduceService.ts

import api from './api';

export type IntroduceItem = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
};

export const getIntroduceList = async (): Promise<any> => {
  const response = await api.get(`/Introduce/list`);
  return response.data;
};

export const getIntroduceById = async (id: number): Promise<any> => {
  const response = await api.get(`/Introduce/${id}`);
  return response.data;
};
