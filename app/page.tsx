'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/auth/authThunk';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Ambil state dari Redux
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth');
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          maxWidth: '32rem',
          width: '100%'
        }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            textAlign: 'center',
            color: '#1e293b'
          }}>
            🔐 Authentication Required
          </h1>
          
          <p style={{ 
            textAlign: 'center', 
            color: '#64748b',
            marginBottom: '2rem'
          }}>
            Anda harus login terlebih dahulu untuk mengakses halaman ini
          </p>
          
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Login Sekarang
          </button>
          
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f1f5f9',
            borderRadius: '0.375rem'
          }}>
            <p style={{ fontWeight: '500', color: '#475569', marginBottom: '0.5rem' }}>
              🚀 Redux Status:
            </p>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <p>• isAuthenticated: <strong>{isAuthenticated ? '✅ true' : '❌ false'}</strong></p>
              <p>• User data: <strong>{user ? '✅ loaded' : '❌ null'}</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
              🏠 Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Welcome back, {user?.username}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
        
        {/* Main Content */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            🎉 Selamat Datang di Redux Demo!
          </h2>
          
          {/* User Info */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f0f9ff',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.75rem' }}>
              👤 User Information
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div>
                <span style={{ color: '#475569', fontSize: '0.875rem' }}>Username:</span>
                <span style={{ fontWeight: '500', marginLeft: '0.5rem' }}>{user?.username}</span>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '0.875rem' }}>Email:</span>
                <span style={{ fontWeight: '500', marginLeft: '0.5rem' }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '0.875rem' }}>User ID:</span>
                <span style={{ fontWeight: '500', marginLeft: '0.5rem' }}>{user?.id}</span>
              </div>
            </div>
          </div>
          
          {/* Success Message */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#dcfce7',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            border: '1px solid #86efac'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <p style={{ fontWeight: '600', color: '#166534' }}>
                  SELAMAT! Redux Authentication BERHASIL!
                </p>
                <p style={{ color: '#166534', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  State management dengan Redux Toolkit sudah berjalan dengan sempurna.
                </p>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fef3c7',
            borderRadius: '0.375rem',
            border: '1px solid #fcd34d'
          }}>
            <h3 style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.75rem' }}>
              🚀 Langkah Selanjutnya
            </h3>
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ color: '#92400e' }}>1. Tambahkan API nyata untuk login</li>
              <li style={{ color: '#92400e' }}>2. Implementasi form validation</li>
              <li style={{ color: '#92400e' }}>3. Tambahkan register page</li>
              <li style={{ color: '#92400e' }}>4. Implementasi protected routes</li>
              <li style={{ color: '#92400e' }}>5. Tambahkan persistensi dengan localStorage</li>
            </ol>
          </div>
          
          {/* Redux Debug Info */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f1f5f9',
            borderRadius: '0.375rem'
          }}>
            <p style={{ fontWeight: '500', color: '#475569', marginBottom: '0.5rem' }}>
              🔍 Redux Debug Information:
            </p>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#64748b',
              fontFamily: 'monospace',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              overflow: 'auto'
            }}>
              {JSON.stringify({ user, isAuthenticated }, null, 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}