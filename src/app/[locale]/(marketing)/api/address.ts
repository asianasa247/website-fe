import api from './api';

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

export const addressApi = {
  getProvinces,
  getDistricts,
  getWards,
};

// import api from './api';

// export type Province = {
//   id: string;
//   name: string;
//   code: string;
// };

// export type District = {
//   id: string;
//   name: string;
//   code: string;
//   provinceId: string;
// };

// export type Ward = {
//   id: string;
//   name: string;
//   code: string;
//   districtId: string;
// };

// export const addressApi = {
//   getProvinces: async (): Promise<any> => {
//     const response = await api.get('/WebAddress/getProvince');
//     return response.data;
//   },

//   getDistricts: async (provinceId: string): Promise<any> => {
//     const response = await api.get(`/WebAddress/getDistrict/${provinceId}`);
//     return response.data;
//   },

//   getWards: async (districtId: string): Promise<any> => {
//     const response = await api.get(`/WebAddress/getWard/${districtId}`);
//     return response.data;
//   },
// };
