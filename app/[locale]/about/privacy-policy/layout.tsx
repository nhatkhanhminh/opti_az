import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | OptiFund',
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 