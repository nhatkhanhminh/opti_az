import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partners | OptiFund',
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 