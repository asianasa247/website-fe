'use client';

import { useEffect, useState } from 'react';
import RecruitmentList from '@/components/RecruitmentList';
import { getList } from '../api/recruitment';

export default function RecruitmentPage() {
  const [recruitments, setRecruitments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: currentPage,
          limit: pageSize,
        };
        const result = await getList(params);

        // Kỳ vọng result = { items: [...], total: number }
        setRecruitments(result.items || []);
        setTotalItems(result.total || 0);
      } catch (error) {
        console.error('Error fetching recruitment list:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  return (
    <RecruitmentList
      recruitments={recruitments}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={page => setCurrentPage(page)}
    />
  );
}
