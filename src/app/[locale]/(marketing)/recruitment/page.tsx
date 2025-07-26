'use client';

import { useEffect, useState } from 'react';
import RecruitmentList from '@/components/RecruitmentList';
import { getList } from '../api/recruitment';

export default function RecruitmentPage() {
  const [recruitments, setRecruitments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const pageSize = 10;

  useEffect(() => {
    getList({ page: currentPage, pageSize })
      .then((data) => {
        setRecruitments(data.data);
        setTotalItems(data.totalItems);
      })
      .catch((error) => {
        console.error('Failed to fetch recruitment data:', error);
      });
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
