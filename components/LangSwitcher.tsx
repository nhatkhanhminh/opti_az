'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useCallback } from 'react';

export default function LangSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const switchLocale = useCallback((newLocale: string) => {
    // Lưu locale vào localStorage để có thể truy cập từ client
    if (typeof window !== 'undefined') {
      localStorage.setItem('NEXT_LOCALE', newLocale);
    }
    
    // Sử dụng router.push với soft navigation
    router.push(pathname, { locale: newLocale });
    
    // Tải lại trang để đảm bảo language được áp dụng đúng
    // Chúng ta buộc phải làm điều này vì Next.js không tự động 
    // cập nhật thành phần gốc khi thay đổi ngôn ngữ
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [pathname, router]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Languages className="h-6 w-6" />
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchLocale('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('ru')}
          className={locale === 'ru' ? 'bg-accent' : ''}
        >
          Русский
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('zh')}
          className={locale === 'zh' ? 'bg-accent' : ''}
        >
            中文
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('jp')}
          className={locale === 'jp' ? 'bg-accent' : ''}
        >
            日本語
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('kr')}
          className={locale === 'kr' ? 'bg-accent' : ''}
        >
            한국어
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('vi')}
          className={locale === 'vi' ? 'bg-accent' : ''}
        >
          Tiếng Việt
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('pt')}
          className={locale === 'pt' ? 'bg-accent' : ''}
        >
          Português
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLocale('fr')}
          className={locale === ' ' ? 'bg-accent' : ''}
        >
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 