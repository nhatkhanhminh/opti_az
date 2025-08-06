import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vòng Quay May Mắn - AZ Coin',
  description: 'Chơi game vòng quay may mắn với token AZC và nhận phần thưởng hấp dẫn',
};

export default function LuckyWheelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}