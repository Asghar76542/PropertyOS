import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = req.nextUrl.pathname

  // Define paths that require authentication
  const protectedPaths = ['/dashboard', '/tenant-dashboard', '/properties', '/payments', '/maintenance', '/documents', '/financial', '/compliance']
  
  const isProtected = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (isProtected) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', encodeURI(req.url))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
