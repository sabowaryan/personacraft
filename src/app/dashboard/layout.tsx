'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import LogoWithText from '@/components/LogoWithText';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50/30 flex">
      {/* Overlay pour mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'fixed inset-y-0 left-0 z-40'
      }`}>
        <Sidebar 
          isCollapsed={!isMobile && sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        !isMobile ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''
      }`}>
        {/* Bouton menu mobile */}
        {isMobile && !sidebarOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <LogoWithText 
              text="PersonaCraft" 
              size="sm" 
              variant="primary"
            />
          </div>
        )}
        
        {/* Header intégré */}
        {!(isMobile && sidebarOpen) && <Header />}
        
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}