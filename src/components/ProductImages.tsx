import React from 'react';

type Props = {
  images: string[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
};

export default function ProductImages({ images, currentIndex, setCurrentIndex }: Props) {
  const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  return (
    <div className="w-full md:w-2/5 flex flex-col gap-4">
      <div className="hidden md:flex flex-col gap-2 w-20">
        {images.map((img, i) => (
          <img
            key={i}
            src={imageUrl + img}
            className={`w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 ${
              i === currentIndex ? 'border-2 border-blue-500' : ''
            }`}
            onClick={() => setCurrentIndex(i)}
            alt={`Thumbnail ${i + 1}`}
          />
        ))}
      </div>
      <div className="w-full">
        <img
          src={imageUrl + images[currentIndex]}
          alt="Main"
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
