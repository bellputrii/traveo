/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Key,
  Globe,
  Phone,
  MapPin,
  Camera,
  Bell,
  Lock,
  LogOut,
  Upload,
  CreditCard,
  Settings,
  Heart,
  BookOpen,
  Star,
  Award,
  Users,
  FileText,
  Clock
} from 'lucide-react';

// Types untuk data user
interface UserProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
}

// Fetch user profile dari API
const fetchUserProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch("https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api/users/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const data = await response.json();
  return data;
};

// Komponen Profile Content
const ProfileContent = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    location: '',
    website: '',
  });
  const [stats, setStats] = useState({
    articles: 0,
    followers: 0,
    following: 0,
    likes: 0,
  });

  useEffect(() => {
    loadUserProfile();
    // Simulasi stats (nanti bisa diganti dengan API nyata)
    setStats({
      articles: 24,
      followers: 1248,
      following: 342,
      likes: 5421,
    });
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await fetchUserProfile();
      setUserProfile(profile);
      setFormData({
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Di sini bisa ditambahkan API untuk update profile
      // Untuk sekarang hanya simulasi
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      // Show success message
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userProfile) {
      setFormData({
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1f3a5f] mx-auto mb-4" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <button 
              onClick={loadUserProfile}
              className="text-red-500 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Profile</h1>
            <p className="text-gray-500">Manage your account and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#213448] to-[#1a2a3a] flex items-center justify-center text-white text-4xl font-bold mb-2">
                      {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">{userProfile?.username}</h2>
                    <p className="text-gray-500 text-sm">{userProfile?.email}</p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      userProfile?.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {userProfile?.confirmed ? 'Verified Account' : 'Pending Verification'}
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Articles', value: stats.articles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
                      { label: 'Followers', value: stats.followers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
                      { label: 'Following', value: stats.following, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' },
                      { label: 'Likes', value: stats.likes, icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
                    ].map((stat, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Account Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500">Member Since</p>
                        <p className="font-medium text-gray-900">{userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Key className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500">Account Type</p>
                        <p className="font-medium text-gray-900">{userProfile?.provider === 'local' ? 'Local Account' : 'Social Account'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {userProfile?.bio || 'No bio yet. Tell us about yourself!'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info & Actions */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: userProfile?.email, editable: false },
                  { icon: Phone, label: 'Phone', value: formData.phone, placeholder: '+1 234 567 8900', field: 'phone' },
                  { icon: MapPin, label: 'Location', value: formData.location, placeholder: 'New York, USA', field: 'location' },
                  { icon: Globe, label: 'Website', value: formData.website, placeholder: 'https://yourwebsite.com', field: 'website' },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <label className="text-sm text-gray-500">{item.label}</label>
                    </div>
                    {isEditing && item.field ? (
                      <input
                        type="text"
                        value={item.value || ''}
                        onChange={(e) => setFormData({...formData, [item.field!]: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1f3a5f] focus:border-transparent"
                        placeholder={item.placeholder}
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{item.value || 'Not provided'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Settings, label: 'Account Settings', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Bell, label: 'Notification Preferences', color: 'text-purple-600', bg: 'bg-purple-50' },
                  { icon: Lock, label: 'Privacy & Security', color: 'text-green-600', bg: 'bg-green-50' },
                  { icon: BookOpen, label: 'Reading History', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <div className={`w-10 h-10 ${action.bg} ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="bg-gradient-to-r from-[#1f3a5f]/5 to-[#162b47]/5 rounded-2xl border border-[#1f3a5f]/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-gray-900">Ready to save changes?</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1f3a5f] text-white rounded-xl hover:bg-[#162b47] transition-all font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-[#1f3a5f] hover:text-[#162b47] font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Published new article', time: '2 hours ago', icon: FileText, color: 'text-blue-600' },
              { action: 'Gained 12 new followers', time: '1 day ago', icon: Users, color: 'text-purple-600' },
              { action: 'Article reached 100 likes', time: '3 days ago', icon: Heart, color: 'text-pink-600' },
              { action: 'Updated profile information', time: '1 week ago', icon: User, color: 'text-green-600' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Account Security Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Security</h3>
              <p className="text-sm text-gray-500">Keep your account secure</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Secure
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                </div>
              </div>
              <button className="w-full mt-3 px-4 py-2 text-sm font-medium text-[#1f3a5f] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                Change Password
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Login Activity</p>
                  <p className="text-sm text-gray-500">Last login: Today, 10:30 AM</p>
                </div>
              </div>
              <button className="w-full mt-3 px-4 py-2 text-sm font-medium text-[#1f3a5f] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                View Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
        />
        <Header 
          activeMenu={activeMenu}
          userName="Guest"
          userEmail="Silakan login"
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 md:ml-64 pt-16 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">Please login to access profile page</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all mx-auto"
            >
              Login to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
      />
      <Header 
        activeMenu={activeMenu}
        userName={user?.name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <main className="md:ml-64 pt-6">
        <ProfileContent />
      </main>
    </div>
  );
}