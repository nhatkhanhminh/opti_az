import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Media Resources | OptiFund',
};

export default function MediaResourceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 