import React from 'react';
import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  activeMenu: string;
}

export function Header({ activeMenu }: HeaderProps) {
  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      deteksi: 'Deteksi Penyakit',
      artikel: 'Daftar Artikel',
      riwayat: 'Riwayat Deteksi',
      pengaturan: 'Pengaturan',
    };
    return titles[activeMenu] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Breadcrumbs */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Pages / {getPageTitle()}</p>
          <h2 className="text-gray-900">{getPageTitle()}</h2>
        </div>

        {/* Right Side - Search and Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type here..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
