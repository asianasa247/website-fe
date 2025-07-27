import QuantitySelector from './QuantitySelector';

export default function ProductInfo({
  product,
  quantity,
  setQuantity,
  category,
}: any) {
  const lang = 'vn';
  const formatCurrency = (value: number) => {
    return value?.toLocaleString('vi-VN'); // Nếu muốn dùng format theo ngôn ngữ thì sửa đây
  };

  const getLocalizedPrice = (onlyNumber = false) => {
    let price = 0;

    switch (lang) {
      default:
        price = product?.webPriceVietNam || 0;
        break;
    }

    return onlyNumber ? price : `${formatCurrency(price)} VNĐ`;
  };

  const displayPrice = getLocalizedPrice(true);
  const originalPrice = (() => {
    switch (lang) {
      // case 'en':
      //   return product?.originalPriceEnglish;
      // case 'ko':
      //   return product?.originalPriceKorea;
      default:
        return product?.originalPriceVietNam;
    }
  })();

  return (
    <div className="w-full md:w-3/5 p-4">
      <h1 className="text-3xl font-bold mb-4">{product?.name}</h1>

      <div className="mb-4">
        {originalPrice > displayPrice && (
          <span className="text-gray-500 line-through mr-3">
            {formatCurrency(originalPrice)}
            {' '}
            VNĐ
          </span>
        )}
        <span className="text-2xl font-bold">{getLocalizedPrice()}</span>
      </div>

      <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

      <button type="button" className="w-full py-3 bg-orange-500 text-white rounded-lg mb-6 hover:bg-orange-600 transition">
        🛒 Thêm vào giỏ
      </button>

      <div className="text-gray-700 text-lg">
        <h3 className="font-bold mb-4 text-2xl underline">Mô tả</h3>
        <p>{product?.description}</p>
        <div className="mt-4">
          <div>
            <strong>Danh mục:</strong>
            {' '}
            {category?.name}
          </div>
          <div>
            <strong>Đơn vị:</strong>
            {' '}
            {product?.stockUnit}
          </div>
        </div>
      </div>
    </div>
  );
}
