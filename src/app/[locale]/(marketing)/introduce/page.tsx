'use client';

import { useEffect, useState } from 'react';
import { getIntroduceDetail, getIntroduceLists } from '../api/introduce';

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

      {loading
        ? (
            <p>Đang tải...</p>
          )
        : (
            <IntroduceDetail id={introduceList[0]?.id || ''} />
          )}
    </div>
  );
}

function IntroduceDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getIntroduceDetail(id).then(data => setDetail(data));
    }
  }, [id]);

  if (!detail) {
    return <p>Đang tải chi tiết...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{detail.title}</h1>
      <div
        className="prose prose-blue max-w-none"
        dangerouslySetInnerHTML={{ __html: detail.content }}
      />
    </div>
  );
}
