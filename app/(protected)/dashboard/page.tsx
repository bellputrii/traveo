'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout, getMe } from '../../../store/auth/authThunk';
import { localLogout } from '../../../store/auth/authSlice';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  LogOut, 
  User, 
  FileText, 
  FolderTree, 
  MessageSquare, 
  Users,
  Settings,
  PlusCircle,
  BarChart3,
  ChevronRight,
  BookOpen,
  Eye,
  TrendingUp,
  MoreVertical
} from 'lucide-react';

// Komponen Loading Skeleton untuk dashboard
const DashboardSkeleton = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeMenu={activeMenu}
        userName="Loading..."
        userEmail="loading..."
      />
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="md:ml-64 pt-16">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-6 md:mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats Grid Skeleton - Hanya 4 card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Info Skeleton */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i}>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activities Skeleton */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Komponen Dashboard Content yang terpisah
const DashboardContent = ({ user }: { user: any }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(localLogout());
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(localLogout());
      router.push('/auth');
    }
  };

  // Data untuk 4 card utama
  const dashboardCards = [
    { 
      label: 'Total Artikel', 
      value: '1,245', 
      icon: BookOpen, 
      color: 'bg-gradient-to-br from-[#213448] to-[#1a2a3a]',
      path: '/articles',
      description: 'Kelola semua artikel Anda',
      stats: { change: '+12%', trend: 'up' }
    },
    { 
      label: 'Kategori', 
      value: '12', 
      icon: FolderTree, 
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      path: '/categories',
      description: 'Organisasikan konten Anda',
      stats: { change: '+3', trend: 'up' }
    },
    { 
      label: 'Komentar', 
      value: '8,923', 
      icon: MessageSquare, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      path: '/comments',
      description: 'Kelola interaksi pengguna',
      stats: { change: '+24%', trend: 'up' }
    },
    { 
      label: 'Pengunjung', 
      value: '245K', 
      icon: Users, 
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      path: '/analytics',
      description: 'Pantau statistik pengunjung',
      stats: { change: '+18%', trend: 'up' }
    },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'membuat artikel baru', target: 'Exploring Bali', time: '2 jam yang lalu', icon: FileText },
    { user: 'Sarah Smith', action: 'mengomentari', target: 'Tokyo Food Guide', time: '4 jam yang lalu', icon: MessageSquare },
    { user: 'Mike Johnson', action: 'membuat kategori', target: 'Adventure Travel', time: '1 hari yang lalu', icon: FolderTree },
    { user: 'Emma Wilson', action: 'memperbarui profil', time: '2 hari yang lalu', icon: User },
    { user: 'Alex Brown', action: 'menghapus artikel', target: 'Santorini Sunset', time: '3 hari yang lalu', icon: FileText },
  ];

  const popularArticles = [
    { title: 'Menjelajahi Keindahan Bali', views: 1234, likes: 89, date: '15 Jan 2024', category: 'Asia' },
    { title: 'Panduan Kuliner Tokyo 2024', views: 987, likes: 65, date: '14 Jan 2024', category: 'Kuliner' },
    { title: 'Spot Sunset Terbaik Santorini', views: 1567, likes: 112, date: '13 Jan 2024', category: 'Eropa' },
    { title: 'Petualangan Pulau Thailand', views: 845, likes: 43, date: '10 Jan 2024', category: 'Petualangan' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Selamat datang, {user?.name || 'User'} 👋
        </h1>
        <p className="text-gray-600">
          Kelola konten travel blog Anda dengan mudah
        </p>
      </div>

      {/* 4 Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            onClick={() => router.push(card.path)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  card.stats.trend === 'up' 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {card.stats.change}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
                <p className="text-sm font-medium text-gray-900 mb-1">{card.label}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 group-hover:text-[#213448] transition-colors">
                    Lihat detail
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#213448] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profil Anda</CardTitle>
            <CardDescription>Informasi akun</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#213448] to-[#1a2a3a] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{user?.name || 'User'}</h3>
                <p className="text-gray-600 text-sm">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Admin
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 text-sm">Bergabung</span>
                <span className="font-medium text-sm">Jan 2024</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 text-sm">Login Terakhir</span>
                <span className="font-medium text-sm">2 jam lalu</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-6 border-gray-200 hover:bg-gray-50 text-sm"
              onClick={() => router.push('/dashboard/profile')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profil
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                <CardDescription>Aktivitas tim Anda</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-[#213448] text-sm"
              >
                Lihat semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                    <activity.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                      {activity.target && (
                        <span className="font-medium text-[#213448]"> {activity.target}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Articles */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Artikel Populer</CardTitle>
                <CardDescription>Artikel paling banyak dilihat</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-[#213448] text-sm"
                onClick={() => router.push('/articles')}
              >
                Lihat semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer border border-gray-100"
                  onClick={() => router.push(`/articles/${index}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#213448]/10 to-[#213448]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-[#213448]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-[#213448] transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{article.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{article.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{article.views.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">views</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#213448] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch user data hanya jika belum ada
    if (!user && isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, user, isAuthenticated]);

  // Show skeleton selama loading
  if (loading || (!user && isAuthenticated)) {
    return <DashboardSkeleton />;
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <Header 
          activeMenu={activeMenu}
          userName="Guest"
          userEmail="Please login"
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 md:ml-64 pt-16 flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Autentikasi Diperlukan</h3>
            <p className="text-gray-600 mb-4">Silakan login untuk mengakses dashboard</p>
            <Button 
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-[#213448] to-[#1a2a3a] text-white hover:from-[#1a2a3a] hover:to-[#213448]"
            >
              Login
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <Header 
        activeMenu={activeMenu}
        userName={user?.name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <main className="md:ml-64 pt-16">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardContent user={user} />
          </div>
        </div>
      </main>
    </div>
  );
}