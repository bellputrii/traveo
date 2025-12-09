// components/public/LayoutNavbar.tsx
'use client';

import { ReactNode } from 'react';

interface LayoutNavbarProps {
  children: ReactNode;
  withSidebar?: boolean;
  sidebarOpen?: boolean;
}

export default function LayoutNavbar({ 
  children, 
  withSidebar = true,
  sidebarOpen = false 
}: LayoutNavbarProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <main className={`
        flex-1 transition-all duration-300
        ${withSidebar ? 'md:ml-64' : ''}
        ${sidebarOpen ? 'ml-72' : 'ml-0'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}