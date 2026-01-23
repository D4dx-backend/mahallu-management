import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayoutStore } from '@/store/layoutStore';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isSubmenuOpen = useLayoutStore((s) => s.isSubmenuOpen);
  const location = useLocation();
  const [contentVisible, setContentVisible] = useState(true);

  // Left sidebar is 96px (w-24). Submenu is 192px (w-48). Total when open: 288px.
  const contentMarginLeftClass = isSubmenuOpen ? 'ml-[288px]' : 'ml-24';

  // Fade content on route changes
  useEffect(() => {
    setContentVisible(false);
    const raf = window.requestAnimationFrame(() => setContentVisible(true));
    return () => window.cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/20" />
      </div>
      
      <Sidebar />
      <div
        className={
          'relative flex flex-1 flex-col overflow-hidden z-40 ' +
          contentMarginLeftClass +
          ' transition-[margin-left] duration-200 ease-out'
        }
      >
        <Header />
        <main
          className={
            'flex-1 overflow-y-auto p-6 scroll-smooth transition-opacity duration-150 ease-out ' +
            (contentVisible ? 'opacity-100' : 'opacity-0')
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}

