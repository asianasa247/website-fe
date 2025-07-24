// components/RecruitmentList.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

type Recruitment = {
  id: number;
  title: string;
  description: string;
  expiredApply: string;
  imageUrl?: string;
};

type Props = {
  recruitments: Recruitment[];
  totalItems: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
};

export default function RecruitmentList({
  recruitments,
  totalItems,
  pageSize = 5,
  onPageChange,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  if (totalItems === 0) {
    return <p className="text-center text-gray-500">Không có tin tuyển dụng nào.</p>;
  }

  return (
    <div className="recruitment-wrap px-2 py-2 lg:py-4 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {recruitments.map(recruit => (
          <div
            key={recruit.id}
            className="rounded-xl shadow-md overflow-hidden border bg-white flex flex-col"
          >
            <div className="h-64 overflow-hidden">
              <img
                src={
                  recruit.imageUrl
                  || 'https://viendaotaovcg.com/wp-content/uploads/2020/08/Banner-tuyen-dung-Organic-Life-2020.jpg'
                }
                alt={recruit.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{recruit.title}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Hạn Nộp:
                  {' '}
                  {new Date(recruit.expiredApply).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-gray-700 text-sm line-clamp-4">{recruit.description}</p>
              </div>
              <div className="mt-4">
                <Link
                  href={`/recruitment/${recruit.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition"
                >
                  Chi tiết
                  <span className="ml-2">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
