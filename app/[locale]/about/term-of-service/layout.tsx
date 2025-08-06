import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | OptiFund',
};

export default function TermOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 