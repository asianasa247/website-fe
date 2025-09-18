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

// Lấy cấu hình category type=5 để đọc productCount (số lượng SP hiển thị trên UI)
export const getCategoriesByType = async (
  type: number,
  page: number = 1,
  pageSize: number = 1000,
) => {
  const response = await api.get('/Category', { params: { type, page, pageSize } });
  return response.data;
};

export const getPartnerProductsSelected = async (): Promise<any[]> => {
  const res = await api.get('/AdditionWeb/goods/selected', {
    headers: { accept: 'application/json' },
  });
  const list = Array.isArray(res.data) ? res.data : [];

  const normalizeImg = (p: string | null | undefined) =>
    (p || '').replace(/\\/g, '/');

  const mapped = list.flatMap((site: any) => {
    const urlWeb = site?.urlWeb;
    const goods = site?.paging?.goods || site?.goods || [];
    return (Array.isArray(goods) ? goods : []).map((g: any) => {
      // Chọn tên hiển thị
      const name = g?.webGoodNameVietNam
        ?? g?.detailName2
        ?? g?.detailName1
        ?? '';

      // Chọn giá hiển thị
      const price = (typeof g?.salePrice === 'number' && g.salePrice > 0 && g.salePrice)
        || (typeof g?.price === 'number' && g.price > 0 && g.price)
        || (typeof g?.discountPrice === 'number' && g.discountPrice > 0 && g.discountPrice)
        || 0;

      // Map theo format card cũ
      return {
        id: g?.id,
        image1: normalizeImg(g?.image1),
        webGoodNameVietNam: name,
        titleVietNam: g?.titleVietNam ?? g?.titleEnglish ?? g?.titleKorea ?? '',
        detail1: g?.detailName1 ?? '',
        detail2: g?.detailName2 ?? '',
        webPriceVietNam: price,
        discount: 0,
        heart: false,
        urlWeb, // để ProductCard mở link ngoài & ẩn nút giỏ hàng
      };
    });
  });

  return mapped;
};
