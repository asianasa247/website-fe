import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/header';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <div className="w-full px-1 text-gray-700 antialiased">
        {props.children}
      </div>
    </>
  );
}
