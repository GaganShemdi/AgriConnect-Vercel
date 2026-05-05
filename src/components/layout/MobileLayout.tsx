import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  title?: string;
}

export default function MobileLayout({ children, hideNav, title }: MobileLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-primary-pale/40 flex justify-center">
      <div className="relative w-full max-w-mobile min-h-screen bg-white shadow-lg flex flex-col">
        {title && (
          <header className="sticky top-0 z-30 bg-primary text-white px-4 py-3 shadow-sm">
            <h1 className="text-lg font-semibold">{title}</h1>
          </header>
        )}
        <main className={`flex-1 ${hideNav ? 'pb-4' : 'pb-24'}`}>{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
