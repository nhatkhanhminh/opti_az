import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Token | OptiFund',
};

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 