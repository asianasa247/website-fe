/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
/* eslint-disable @next/next/no-img-element */
import React from 'react';

type Props = {
  images: any[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
};

export default function ProductImages({ images, currentIndex, setCurrentIndex }: Props) {
  const imageUrl = process.env.NEXT_PUBLIC_SERVER_URL_IMAGE;

  return (
    <div className="w-full md:w-2/5 flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="hidden md:flex flex-col gap-3 w-24">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
              i === currentIndex ? 'border-blue-500' : 'border-gray-200'
            }`}
            onClick={() => setCurrentIndex(i)}
          >
            <img
              src={imageUrl + img}
              alt={`Thumbnail ${i + 1}`}
              className="w-24 h-24 object-cover"
            />
            {i === currentIndex && (
              <span className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse"></span>
            )}
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            key={images[currentIndex]} // để tạo hiệu ứng fade khi đổi ảnh
            src={imageUrl + images[currentIndex]}
            alt="Main"
            className="w-full h-auto rounded-2xl transition-opacity duration-300 ease-in-out"
          />
        </div>
      </div>
    </div>
  );
}
