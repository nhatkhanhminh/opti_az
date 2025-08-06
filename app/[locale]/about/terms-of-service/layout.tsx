import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | OptiFund',
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 