import type { Metadata } from 'next';
import { getIntroduceDetail } from '../../api/introduce';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const detail = await getIntroduceDetail(params.id);
  return {
    title: detail.title,
    description: detail.description,
  };
}

export default async function IntroduceDetailPage({ params }: { params: { id: string } }) {
  const detail = await getIntroduceDetail(params.id);

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
