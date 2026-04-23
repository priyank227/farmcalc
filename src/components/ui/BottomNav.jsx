'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User } from 'lucide-react';
import useLanguageStore from '@/store/useLanguageStore';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguageStore();

  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Link href="/" className={`flex flex-col items-center gap-1 active:scale-95 transition-transform ${pathname === '/' ? 'text-[#166534]' : 'text-gray-400'}`}>
        <Home className={`w-6 h-6 ${pathname === '/' ? 'text-[#166534]' : 'text-gray-400'}`} />
        <span className={`text-[10px] font-bold ${pathname === '/' ? 'text-[#166534]' : 'text-gray-500'}`}>{t('home')}</span>
      </Link>
      <Link href="/profile/logs" className={`flex flex-col items-center gap-1 active:scale-95 transition-transform ${pathname === '/profile/logs' ? 'text-[#166534]' : 'text-gray-400'}`}>
        <FileText className={`w-6 h-6 ${pathname === '/profile/logs' ? 'text-[#166534]' : 'text-gray-400'}`} />
        <span className={`text-[10px] font-bold ${pathname === '/profile/logs' ? 'text-[#166534]' : 'text-gray-500'}`}>{t('report')}</span>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center gap-1 active:scale-95 transition-transform ${pathname === '/profile' ? 'text-[#166534]' : 'text-gray-400'}`}>
        <User className={`w-6 h-6 ${pathname === '/profile' ? 'text-[#166534]' : 'text-gray-400'}`} />
        <span className={`text-[10px] font-bold ${pathname === '/profile' ? 'text-[#166534]' : 'text-gray-500'}`}>{t('profile')}</span>
      </Link>
    </div>
  );
}
