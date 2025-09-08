import { NextAuthOptions, Session } from 'next-auth'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from '@/lib/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AppError, ErrorCode } from '@/lib/errors'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check for demo accounts first (for testing)
        if (credentials.email === 'landlord@example.com' && credentials.password === 'password123') {
          return {
            id: 'demo-landlord',
            email: 'landlord@example.com',
            name: 'Demo Landlord',
            role: 'LANDLORD' as UserRole,
            firstName: undefined,
            lastName: undefined,
            phone: undefined
          }
        }

        if (credentials.email === 'sarah.johnson@example.com' && credentials.password === 'password123') {
          return {
            id: 'demo-tenant',
            email: 'sarah.johnson@example.com',
            name: 'Sarah Johnson',
            role: 'TENANT' as UserRole,
            firstName: 'Sarah',
            lastName: 'Johnson',
            phone: '+1-555-0123'
          }
        }

        try {
          // Look up user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: {
              landlordProfile: true,
              tenantProfile: true
            }
          })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name,
            role: user.role,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            phone: user.phone || undefined
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.phone = token.phone as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard selection after login
      if (url.startsWith('/')) {
        // If it's a relative URL, check if it's the login callback
        if (url === '/') {
          return `${baseUrl}/select-dashboard`
        }
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      // Default redirect to dashboard selection
      return `${baseUrl}/select-dashboard`
    }
  },
}

export function requireRole(session: Session | null, allowedRoles: UserRole[]) {
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    throw new AppError('Insufficient Permissions', 403, ErrorCode.INSUFFICIENT_PERMISSIONS);
  }
}

declare module 'next-auth' {
  interface User {
    role: UserRole
    firstName?: string
    lastName?: string
    phone?: string
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      firstName?: string
      lastName?: string
      phone?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    firstName?: string
    lastName?: string
    phone?: string
  }
}
