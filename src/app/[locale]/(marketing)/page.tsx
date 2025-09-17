import Head from 'next/head';
import HomeClient from '@/components/HomeClient';
import Slider from '@/components/Silder';
import dashboardService from './api/dashboard';

export default async function Index() {
  // 1. Lấy danh sách categories
  const categoryRes = await dashboardService.getListWebCategory();
  const allCategories = categoryRes.data || [];

  const TYPE_ONE_PAGE = 7; // tương đương với enum/type bên Angular
  const menuTypes = allCategories
    .filter((cat: any) => cat.type === TYPE_ONE_PAGE)
    .map((cat: any) => ({ code: cat.code, id: cat.id }));

  // 2. Gọi API lấy item theo category
  const itemsRes = await dashboardService.getItemsByCategory({ menuTypes });
  const items = itemsRes.data || [];

  // 2.1. Map type -> productCount (mỗi type là 1 menu)
  // Ưu tiên productCount > 0; nếu nhiều bản ghi cùng type thì lấy cái đầu tiên có giá trị.
  const productCountByType: Record<number, number> = {};
  for (const c of allCategories) {
    if (
      typeof c?.type === 'number' && typeof c?.productCount === 'number' && c.productCount > 0 && typeof productCountByType[c.type] === 'undefined'
    ) {
      productCountByType[c.type] = c.productCount;
    }
  }

  // 3. Gộp categories có item & được hiển thị
  const webCategories = items
    .map((item: any) => {
      const matchedCat = allCategories.find(
        (cat: any) => cat.id === item.category.id && cat.isShowWeb,
      );
      if (!matchedCat) {
        return null;
      }
      return {
        ...matchedCat,
        label: matchedCat.name,
        icon: matchedCat.icon,
        isProduct: item.isProduct,
        products: item.products,
        news: item.news,
      };
    })
    .filter(Boolean); // loại null

  // 4. Trả về giao diện
  return (
    <>
      <Head>
        <title>JWKJOB</title>
        <meta name="description" content="A Next.js application using Next-Intl for localization." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <Slider />
      {/* Truyền thêm productCountByType để HomeClient set rows theo từng type */}
      <HomeClient webCategories={webCategories} productCountByType={productCountByType} />
    </>
  );
}
