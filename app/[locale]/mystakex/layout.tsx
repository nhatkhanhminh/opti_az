import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Stakex | OptiFund',
};

export default function MyStakexLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 