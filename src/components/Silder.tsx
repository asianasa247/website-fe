'use client';

import Image from 'next/image'; // Add this import
import { useEffect, useState } from 'react';
import SliderLib from 'react-slick';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// ...existing code...

export default function Slider() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await dashboardService.getAllWebSlider();
        const data = res.data || res;

        const slidersImage: any[] = [];

        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            if (item.adsensePosition === 3 && !item.isVideo) {
              const imageUrl = `${process.env.NEXT_PUBLIC_SERVER_URL_IMAGE}${item.img}`;

              slidersImage.push({
                ...item,
                image: imageUrl,
              });
            }
          });
        }

        setSliders(slidersImage);
      } catch (err) {
        console.error('Error loading sliders:', err);
        setError('Failed to load images');
      }
    };

    fetchSliders();
  }, []);

  const filteredSliders = sliders;

  if (error) {
    return (
      <div className="text-red-500">
        Error:
        {error}
      </div>
    );
  }

  if (!filteredSliders.length) {
    return <div>No slides available</div>;
  }
  const settings = {
    dots: true,
    infinite: filteredSliders.length > 1, // ❗ Tắt infinite nếu chỉ có 1 slide
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="w-full max-w-none mx-auto px-0 py-0 overflow-hidden">
      <SliderLib {...settings} autoplay>
        {filteredSliders.map(slide => (
          <div key={slide.id} className="relative">
            {/* Option 1: Using next/image (Recommended) */}
            <Image
              src={slide.image}
              alt={slide.title || ''}
              width={1920}
              height={1080}
              className="w-full h-[500px] md:h-[700px] object-cover"
              onError={(e) => {
                console.error('Image failed to load:', slide.image);
                e.currentTarget.src = '/fallback-image.jpg'; // Add a fallback image
              }}
            />

            {/* Option 2: Using regular img tag with error handling */}
            {/*
            <img
              src={slide.image}
              alt={slide.title || ''}
              className="w-full h-[500px] md:h-[700px] object-cover"
              onError={(e) => {
                console.error('Image failed to load:', slide.image);
                e.currentTarget.src = '/fallback-image.jpg';
              }}
            />
            */}
          </div>
        ))}
      </SliderLib>
    </div>
  );
}
