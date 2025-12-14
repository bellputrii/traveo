'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/auth/login';
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                {/* <div className="w-full h-full rounded-xl bg-[#213448] flex items-center justify-center">
                  <span className="text-white text-xl font-bold">T</span>
                </div> */}
                <div className="relative w-16 h-16">
                  <Image
                    src="/logo.png" // atau "/logo.png"
                    alt="Traveo Logo"
                    width={50}
                    height={50}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Traveo</h1>
                <p className="text-sm text-gray-500">Explore • Write • Share</p>
              </div>
            </Link>
          </div>
          
          {!isLoginPage && (
            <Link 
              href="/auth/login" 
              className="text-sm text-[#213448] hover:text-[#1a2a3a] font-medium"
            >
              Already have an account? Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            © 2024 Traveo. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Share your journey, inspire the world
          </p>
        </div>
      </div>
    </div>
  );
}