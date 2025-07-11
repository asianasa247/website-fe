import api from './api';

class DashboardService {
  menu: any[] = [];
  socials: any[] = [];

  async getListWebCategory() {
    const res = await api.get('/CategoryWebs/list-category');
    this.menu = res.data.data;
    return res.data;
  }

  async getProductItemByCategory(params: any) {
    const res = await api.get('/WebProduct/get-products-by-menu', { params });
    return res.data;
  }

  async getAllWebSlider() {
    const res = await api.get('/WebSlider/getAll');
    return res.data;
  }

  async getProductByCategory(params: any) {
    const res = await api.get('/WebProduct/get-products-by-menu', { params });
    return res.data.data;
  }

  async getItemsByCategory(data: any) {
    const res = await api.post('/WebProduct/get-items-by-menu', data);
    return res.data;
  }

  async getItemsByCategoryId(id: any) {
    const res = await api.get('/WebProduct/get-items-by-category-id', { params: { Id: id } });
    return res.data;
  }

  async getAllProductSell() {
    const res = await api.get('/WebProduct/get-top-sell');
    return res.data;
  }

  async getSocials() {
    const res = await api.get('/WebSocial/list');
    this.socials = res.data;
    return res.data;
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
