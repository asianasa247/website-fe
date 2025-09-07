/* eslint-disable react/no-array-index-key */
/* eslint-disable @next/next/no-img-element */
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

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isLightboxOpen) {
        return;
      }
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex(i =>
          lightboxImages.length ? (i + 1) % lightboxImages.length : i,
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex(i =>
          lightboxImages.length ? (i - 1 + lightboxImages.length) % lightboxImages.length : i,
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLightboxOpen, lightboxImages.length]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const openLightbox = (images: string[], startIndex: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex(i =>
      lightboxImages.length ? (i + 1) % lightboxImages.length : i,
    );
  };

  const prevImage = () => {
    setLightboxIndex(i =>
      lightboxImages.length ? (i - 1 + lightboxImages.length) % lightboxImages.length : i,
    );
  };

  const imgSrc = (path?: string) => {
    const p = path || '';
    return p ? `${url}${p}` : '/placeholder.jpg';
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      setIsLightboxOpen(false);
    }
    if (e.key === 'ArrowRight') {
      nextImage();
    }
    if (e.key === 'ArrowLeft') {
      prevImage();
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center">Sự kiện</h1>
        <p className="text-muted-foreground mt-1 text-center">
          Hình ảnh các sự kiện và chứng nhận theo từng mục qua các năm.
        </p>
      </header>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i.toString()}
              className="rounded-2xl border bg-white shadow-sm p-4 animate-pulse"
            >
              <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
              <div className="mt-4 h-5 w-2/3 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-full rounded bg-gray-100" />
              <div className="mt-2 h-4 w-5/6 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-8">
          {events.map((event) => {
            const images = (event.files || []).map(f => imgSrc(f.fileUrl));
            const hasImages = images.length > 0;
            const dateText = event.date
              ? new Date(event.date).toLocaleDateString('vi-VN')
              : '—';
            const hasNote = Boolean(event.note);
            const hasLink = Boolean(event.linkDriver);

            return (
              <section
                key={event.id}
                className="rounded-2xl border bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <header className="px-5 pt-6 pb-5 border-b flex flex-col items-center text-center">
                  <h2 className="text-xl md:text-2xl font-semibold leading-snug">
                    {event.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M7 11h5v5H7z" opacity=".3" />
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.11.9 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.1-.89-2-2-2zm0 14H5V9h14v9z" />
                      </svg>
                      {dateText}
                    </span>
                  </div>

                  {hasNote && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 leading-relaxed">
                      {event.note}
                    </p>
                  )}

                  {hasLink && (
                    <a
                      href={event.linkDriver}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 1 0 0 6h3v2h-3a5 5 0 0 1-5-5zm6.1 1h4v-2h-4v2zm5-6h3a5 5 0 1 1 0 10h-3v-2h3a3 3 0 1 0 0-6h-3V7z" />
                      </svg>
                      Xem Google Drive
                    </a>
                  )}
                </header>

                <div className="p-5">
                  {!hasImages && (
                    <div className="w-full h-48 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border flex items-center justify-center text-slate-500">
                      Chưa có hình ảnh
                    </div>
                  )}

                  {hasImages && (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {event.files.map((f, idx) => (
                        <button
                          type="button"
                          key={`${event.id}-${idx}`}
                          onClick={() => openLightbox(images, idx, event.name)}
                          className="group relative block overflow-hidden rounded-xl border bg-white hover:ring-2 hover:ring-blue-200 transition"
                          aria-label="Xem ảnh lớn"
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden">
                            <img
                              src={imgSrc(f.fileUrl)}
                              alt={f.fileName || event.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          </div>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100">
                            Xem ảnh
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              type="button"
              key={i.toString()}
              onClick={() => setCurrentPage(i)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium ${
                currentPage === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 w-full h-full bg-black/80"
            onClick={() => setIsLightboxOpen(false)}
            onKeyDown={handleOverlayKeyDown}
          />
          <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-4">
            <div className="w-full">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="truncate text-base font-medium text-white md:text-lg">
                  {lightboxTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="rounded-full bg-white/10 px-3 py-1 text-xl text-white backdrop-blur hover:bg-white/20"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>

              <div className="relative">
                <img
                  src={lightboxImages[lightboxIndex]}
                  alt="Ảnh sự kiện"
                  className="mx-auto max-h-[80vh] w-auto rounded-2xl shadow-2xl"
                />

                {lightboxImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-white backdrop-blur hover:bg-white/25"
                      aria-label="Ảnh trước"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-white backdrop-blur hover:bg-white/25"
                      aria-label="Ảnh sau"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur">
                      {`${lightboxIndex + 1}/${lightboxImages.length}`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
