import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs | OptiFund',
};

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 