/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * ChatSupportButton.tsx
 * React + TypeScript + Tailwind CSS
 *
 * - Nút nổi (FAB) dùng icon tùy chỉnh hoặc favicon trang.
 * - Click để mở ô nhập tin nhắn (đóng bằng ESC, click ra ngoài).
 * - Prop `iconSrc` cho phép truyền URL ảnh trực tiếp (Flaticon CDN...)
 * - Prop `fabClassName` để chỉnh vị trí/z-index khi cần.
 */

type ChatSupportButtonProps = {
  onSend?: (message: string) => void | Promise<void>;
  placeholder?: string;
  label?: string; // tiêu đề trong panel
  fabClassName?: string; // tùy chỉnh vị trí/z-index của nút nổi
  iconSrc?: string; // URL icon tùy chỉnh
};

const ChatSupportButton: React.FC<ChatSupportButtonProps> = ({
  onSend,
  placeholder = 'Nhập tin nhắn...',
  label = 'Chăm sóc khách hàng',
  fabClassName,
  iconSrc = 'https://cdn-icons-png.flaticon.com/128/10439/10439779.png',
}) => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Tìm favicon hiện tại; nếu không thấy thì dùng '/favicon.ico'
  const faviconUrl = useMemo(() => {
    if (typeof document !== 'undefined') {
      const el = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel*="icon"]',
      ) as HTMLLinkElement | null;
      if (el?.href) {
        return el.href;
      }
    }
    return '/favicon.ico';
  }, []);

  // Icon hiển thị: ưu tiên iconSrc (link ngoài), rồi mới fallback favicon
  const icon = iconSrc ?? faviconUrl;

  // Đóng bằng phím ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Click ra ngoài để đóng
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!panelRef.current) {
        return;
      }
      if (open && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement | null;
        if (target?.dataset?.cskhButton !== 'true') {
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open]);

  const handleSend = async () => {
    const text = msg.trim();
    if (!text) {
      return;
    }
    try {
      await onSend?.(text);
    } finally {
      setMsg('');
    }
  };

  const handleIconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).src = faviconUrl;
  };

  return (
    <>
      {/* Panel nhập tin nhắn */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-4 w-80 rounded-2xl bg-white shadow-xl border border-gray-200 p-3 z-[9999]"
          role="dialog"
          aria-label="Hộp chat chăm sóc khách hàng"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={icon}
                alt="CSKH"
                className="h-5 w-5 rounded-sm"
                onError={handleIconError}
              />
              <span className="font-medium text-sm">{label}</span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
              }}
              className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              aria-label="Đóng"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.36a1 1 0 1 1 1.415 1.414L13.414 10.586l4.362 4.361a1 1 0 0 1-1.415 1.415L12 12l-4.361 4.362a1 1 0 1 1-1.414-1.415L10.586 10.586 6.225 6.225a1 1 0 0 1 0-1.414Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={msg}
              onChange={(e) => {
                setMsg(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSend();
                }
              }}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => {
                void handleSend();
              }}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {/* Nút nổi */}
      <button
        data-cskh-button="true"
        onClick={() => {
          setOpen(v => !v);
        }}
        className={`fixed bottom-4 right-4 h-14 w-14 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-500/30 hover:scale-105 transition z-[9999] ${fabClassName ?? ''}`}
        aria-label="Mở hộp chat chăm sóc khách hàng"
        type="button"
      >
        <img
          src={icon}
          alt="CSKH"
          className="h-7 w-7"
          onError={handleIconError}
        />
      </button>
    </>
  );
};

export default ChatSupportButton;
