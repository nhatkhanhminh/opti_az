import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Stakes | OptiFund',
};

export default function MyStakeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 