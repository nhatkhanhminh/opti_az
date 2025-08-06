import { redirect } from 'next/navigation';

export default function RootPage() {
  // Chuyển hướng trang root sang trang trong [locale]
  redirect('/');
} 