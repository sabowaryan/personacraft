'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Routes qui ne doivent pas avoir la navbar et le footer marketing
  const excludedRoutes = ['/dashboard'];
  const shouldExcludeLayout = excludedRoutes.some(route => pathname.startsWith(route));

  if (shouldExcludeLayout) {
    // Pour le dashboard et autres routes exclues, pas de navbar/footer
    return <div className="min-h-screen">{children}</div>;
  }

  // Pour les autres routes, layout complet avec navbar et footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}