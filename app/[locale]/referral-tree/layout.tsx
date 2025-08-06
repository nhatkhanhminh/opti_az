import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referral Tree | OptiFund',
};

export default function ReferralTreeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 