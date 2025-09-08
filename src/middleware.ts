import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add any additional logic here if needed, e.g., checking roles
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Protects routes if user is not logged in
    },
    pages: {
        signIn: '/login',
    }
  }
);

export const config = {
  // Protect all routes except for public pages like login, signup, landing page
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/maintenance/:path*',
    '/financial/:path*',
    '/payments/:path*',
    '/documents/:path*',
    '/compliance/:path*',
    '/tenant-dashboard/:path*',
    '/select-dashboard',
    '/api/((?!auth|public).*)', // Protect all API routes except auth and public ones
  ],
};