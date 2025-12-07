// app/(auth)/layout.tsx
import { ReactNode } from 'react';
import { Leaf } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header dengan Logo */}
      <div className="bg-white shadow-sm border-b border-gray-100 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">PadiCheck AI</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Disease Detection</p>
          </div>
        </div>
      </div>

      {/* Konten Auth */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 py-4 px-6 text-center">
        <p className="text-sm text-gray-600">
          © 2025 PadiCheck AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}