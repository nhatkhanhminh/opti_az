import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staking | OptiFund',
};

export default function StakingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 