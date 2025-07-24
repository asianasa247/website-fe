// components/EventList.tsx
'use client';

import { useEffect, useState } from 'react';
import { getEventList } from '@/app/[locale]/(marketing)/api/event';

type EventImage = {
  id: number;
  name: string;
  order: number;
  date: string;
  linkDriver: string;
  note: string;
  files: {
    fileUrl: string;
    fileName: string;
  }[];
};

export default function EventList() {
  const url = process.env.NEXT_PUBLIC_SERVER_URL_IMAGE || 'https://default-api-url.com';
  const [events, setEvents] = useState<EventImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const params = {
          Page: currentPage,
          PageSize: pageSize,
          SortField: 'order',
          isSort: true,
        };
        const res = await getEventList(params);
        setEvents(res.data || []);
        setTotalItems(res.totalItems || 0);
      } catch (err) {
        console.error('Error loading events', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [currentPage, pageSize]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Sự kiện</h1>

      {isLoading
        ? (
            <p>Đang tải...</p>
          )
        : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map(event => (
                <div key={event.id} className="border rounded-lg overflow-hidden shadow">
                  <img
                    src={url + event.files?.[0]?.fileUrl || '/placeholder.jpg'}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{event.name}</h2>
                    <p className="text-gray-500 text-sm">
                      Ngày:
                      {new Date(event.date).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm mt-2 line-clamp-3">{event.note}</p>
                    <a
                      href={event.linkDriver}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm mt-3 inline-block"
                    >
                      Xem Google Drive
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`px-4 py-2 border rounded ${
                currentPage === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
