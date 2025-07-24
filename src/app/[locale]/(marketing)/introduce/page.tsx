'use client';

import { useEffect, useState } from 'react';
import { getIntroduceLists } from '../api/introduce';

export default function IntroduceListPage() {
  const [introduceList, setIntroduceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIntroduceLists()
      .then(data => setIntroduceList(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Giới Thiệu</h1>
      {loading
        ? (
            <p>Đang tải...</p>
          )
        : (
            <div className="space-y-4">
              {introduceList?.map(item => (
                <a
                  key={item.id}
                  href={`/introduce/${item.id}`}
                  className="block p-4 bg-white rounded shadow hover:bg-gray-50 transition"
                >
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </a>
              ))}
            </div>
          )}
    </div>
  );
}
