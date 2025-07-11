/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import SliderLib from 'react-slick';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Slider() {
  const [sliders, setSliders] = useState<any[]>([]);
  const lang = 'vi'; // hoặc lấy từ context/i18n nếu có

  useEffect(() => {
    dashboardService.getAllWebSlider().then((res) => {
      const slidersImage: any[] = [];
      const slidersVideo: any[] = [];
      const data = res.data || res;
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item: any) => {
          if (item.adsensePosition === 3) {
            if (item.isVideo) {
              slidersVideo.push({
                ...item,
                image: item.img,
              });
              console.log(item.img);
            } else {
              slidersImage.push({
                ...item,
                image: process.env.NEXT_PUBLIC_SERVER_URL_IMAGE + item.img,
              });
            }
          }
        });
      }
      console.log('Sliders Image:', slidersImage);
      setSliders(slidersImage); // Nếu bạn chỉ muốn hiển thị ảnh, dùng slidersImage
    // Nếu muốn dùng cả video, bạn có thể lưu thêm state cho slidersVideo
    });
  }, []);

  const filteredSliders = loadSliderByLang(sliders, lang);

  if (!filteredSliders.length) {
    return null;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="w-full  max-w-none mx-auto px-0 py-0 overflow-hidden">
      <SliderLib {...settings}>
        {filteredSliders.map((slide, idx) => (
          <div key={slide.id || idx} className=" relative">
            <img
              src={slide.image}
              alt={slide.title || ''}
              className="w-full h-[700px] object-cover"
            />
          </div>
        ))}
      </SliderLib>
    </div>
  );
}
function loadSliderByLang(sliders: any[], lang: string) {
  switch (lang) {
    case 'en':
      return sliders.filter(slide => slide.type === 1);
    case 'ko':
      return sliders.filter(slide => slide.type === 3);
    default:
      return sliders.filter(slide => slide.type === 2);
  }
}
