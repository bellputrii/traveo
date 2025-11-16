import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rute yang memerlukan redeem code - hanya rute spesifik di bawah elearning/[id]
const redeemRequiredRoutes = [
  '/elearning/'
]

// Rute yang boleh diakses tanpa redeem code
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/profile',
  '/api/auth',
  '/public',
  '/ementoring',
  '/elearning' // halaman listing elearning tetap bisa diakses
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cek jika rute adalah public route, izinkan akses
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Cek jika rute memerlukan redeem code - hanya rute di bawah /elearning/[id]
  const requiresRedeem = redeemRequiredRoutes.some(route => {
    if (route === '/elearning/' && pathname.startsWith('/elearning/')) {
      const pathSegments = pathname.split('/').filter(segment => segment)
      
      // Pastikan ini adalah rute /elearning/[id] atau turunannya
      // Contoh: /elearning/123, /elearning/123/section, /elearning/123/section/456, dll.
      if (pathSegments.length >= 2 && pathSegments[0] === 'elearning') {
        // Validasi bahwa segment kedua adalah ID (numeric)
        const idSegment = pathSegments[1]
        if (/^\d+$/.test(idSegment)) {
          return true
        }
      }
    }
    return false
  })
  
  if (!requiresRedeem) {
    return NextResponse.next()
  }

  // Ambil token dari cookies
  const token = request.cookies.get('token')?.value

  if (!token) {
    return redirectToLogin(request)
  }

  try {
    // Cek status user - apakah sudah pernah redeem code
    const hasRedeemed = await checkUserRedeemStatus(token)
    
    if (!hasRedeemed) {
      // Redirect ke profile untuk memasukkan redeem code
      return redirectToProfile(request, pathname)
    }

    // User sudah redeem, lanjutkan request
    const response = NextResponse.next()
    response.headers.set('x-has-redeemed', 'true')
    return response

  } catch (error) {
    console.error('Middleware redeem check error:', error)
    return redirectToProfile(request, pathname)
  }
}

// Helper functions
async function checkUserRedeemStatus(token: string): Promise<boolean> {
  try {
    // Cek status redeem dari API atau localStorage
    // Untuk sementara, kita check localStorage
    // Di production, ganti dengan API call yang sesuai
    
    // Simulasi check - di production, ini harus dari API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test/ping`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      return false
    }

    // Untuk testing, return false agar selalu redirect ke profile
    // Di production, sesuaikan dengan response API
    return false

  } catch (error) {
    console.error('Redeem status check failed:', error)
    return false
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set('callbackUrl', encodeURI(request.url))
  return NextResponse.redirect(loginUrl)
}

function redirectToProfile(request: NextRequest, currentPath: string) {
  const profileUrl = new URL('/profile', request.url)
  profileUrl.searchParams.set('callbackUrl', encodeURI(currentPath))
  profileUrl.searchParams.set('requireRedeem', 'true')
  
  return NextResponse.redirect(profileUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}