import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap | OptiFund',
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 