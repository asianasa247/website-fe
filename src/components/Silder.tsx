/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import SliderLib from 'react-slick';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type SliderItem = {
  id: number;
  title?: string;
  type: number;
  img: string;
  isVideo: boolean;
  adsensePosition: number;
  image: string;
};

export default function Slider() {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const lang = 'vi'; // Hoặc lấy từ context hoặc URL nếu có

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await dashboardService.getAllWebSlider();
        const data = res.data || res;

        const slidersImage: SliderItem[] = [];

        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            if (item.adsensePosition === 3 && !item.isVideo) {
              slidersImage.push({
                ...item,
                image: `${process.env.NEXT_PUBLIC_SERVER_URL_IMAGE}${item.img}`,
              });
            }
          });
        }

        setSliders(slidersImage);
      } catch (err) {
        console.error('Error loading sliders:', err);
      }
    };

    fetchSliders();
  }, []);

  const filteredSliders = loadSliderByLang(sliders, lang);

  if (!filteredSliders.length) {
    return null;
  }

  const settings = {
    dots: true,
    infinite: filteredSliders.length > 1, // ❗ Tắt infinite nếu chỉ có 1 slide
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="w-full max-w-none mx-auto px-0 py-0 overflow-hidden">
      <SliderLib {...settings}>
        {filteredSliders.map(slide => (
          <div key={slide.id} className="relative">
            <img
              src={slide.image}
              alt={slide.title || ''}
              className="w-full h-[500px] md:h-[700px] object-cover"
            />
          </div>
        ))}
      </SliderLib>
    </div>
  );
}

function loadSliderByLang(sliders: SliderItem[], lang: string) {
  switch (lang) {
    case 'en':
      return sliders.filter(slide => slide.type === 1);
    case 'ko':
      return sliders.filter(slide => slide.type === 3);
    default:
      return sliders.filter(slide => slide.type === 2);
  }
}
