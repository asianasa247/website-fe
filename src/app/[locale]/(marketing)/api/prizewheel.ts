import api from './api';

class PrizeWheelService {
  // Nếu muốn lưu trạng thái hiển thị slider, dùng biến thường hoặc React state/context
  isDisplaySlider = false;

  // Lấy danh sách cài đặt vòng quay
  async getListSettingsSpin(): Promise<any[]> {
    const res = await api.get('/WebPrizes/spin');
    return res.data.data;
  }

  // Lấy danh sách giải thưởng
  async getListPrize(): Promise<any[]> {
    const res = await api.get('/WebPrizes/prize');
    return res.data.data;
  }

  // Lấy danh sách khách hàng trúng thưởng
  async getListPrizeCustomer(): Promise<any[]> {
    const res = await api.get('/WebPrizes/prize-customer');
    return res.data.data;
  }

  // Lịch sử quay thưởng
  async getHistorySpins(): Promise<any[]> {
    const res = await api.get('/WebPrizes/spins');
    return res.data.data;
  }

  // Lấy danh sách khách hàng trúng thưởng theo spinId
  async getListPrizeCustomerWithId(id: any): Promise<any[]> {
    const res = await api.get('/WebPrizes/prize-customer', { params: { spinId: id } });
    return res.data.data;
  }

  // Lịch sử vòng quay (phân trang)
  async getHistoryWheel(): Promise<any[]> {
    const res = await api.get('/HistorySpin/HistorySpinPage', {
      params: {
        isSort: true,
        SortField: 'id',
        Page: 1,
        PageSize: 20,
      },
    });
    return res.data.data;
  }
}

const prizeWheelService = new PrizeWheelService();
export default prizeWheelService;
