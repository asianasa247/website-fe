/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import dashboardService from '@/app/[locale]/(marketing)/api/dashboard';
import { useCart } from '@/context/cart-context';

export default function FloatingActions() {
  const [socials, setSocials] = useState<any[]>([]);
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://default-api-url.com';
  const { state: cartState } = useCart();
  const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    // Fetch social links from your API or define them here
    dashboardService.getSocials().then((res) => {
      setSocials(res);
    });
  }, []);

  return (
    <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-50">
      { socials.map(social => (
        <a
          key={social.id}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-50 cursor-pointer"
        >
          <img src={`${url}/${social.fileUrl}`} alt={social.title} className="w-5 h-5" />
        </a>
      ))}
      {/* Zalo */}

      {/* Cart */}
      <button
        type="button"
        className="relative w-12 h-12 flex items-center justify-center rounded-full bg-green-600 text-white shadow-lg"
      >
        <FaShoppingCart className="text-xl" />
        <span className="cursor-pointer absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      </button>
    </div>
  );
}
