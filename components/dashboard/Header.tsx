'use client';

import { Search, Bell, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  activeMenu: string;
  userName?: string;
  userEmail?: string;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ 
  activeMenu, 
  userName = 'User', 
  userEmail = 'user@example.com',
  onSidebarToggle,
  isSidebarOpen = false 
}: HeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      articles: 'Articles',
      categories: 'Categories',
      comments: 'Comments',
      analytics: 'Analytics',
      profile: 'Profile',
    };
    return titles[activeMenu] || 'Dashboard';
  };

  const getBreadcrumb = () => {
    const breadcrumbs: { [key: string]: string } = {
      dashboard: 'Dashboard',
      articles: 'Content / Articles',
      categories: 'Content / Categories',
      comments: 'Content / Comments',
      analytics: 'Analytics',
      profile: 'Account / Profile',
    };
    return breadcrumbs[activeMenu] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="px-4 sm:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Breadcrumbs and Mobile Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onSidebarToggle}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500 mb-0.5">{getBreadcrumb()}</p>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h2>
            </div>

            {/* Mobile Title */}
            <div className="sm:hidden">
              <h2 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Right Side - Search, Notifications, Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-900 font-medium truncate max-w-[120px]">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {userEmail}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#213448] to-[#1a2a3a] rounded-lg md:rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar for Mobile when expanded */}
        {isMobileSearchOpen && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles, categories, users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#213448] focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}