'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Building2, Home, Bell, Settings, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AppHeaderProps {
  title: string
  description: string
  hideNav?: boolean
}

export function AppHeader({ title, description, hideNav = false }: AppHeaderProps) {
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }
  return (
    <header className="border-b bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30"></div>
              <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="text-sm text-white/80">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {!hideNav && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Dashboard</Button>
                    </Link>
                    <Link href="/properties">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Properties</Button>
                    </Link>
                    <Link href="/compliance">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Compliance</Button>
                    </Link>
                    <Link href="/documents">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Documents</Button>
                    </Link>
                    <Link href="/maintenance">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Maintenance</Button>
                    </Link>
                    <Link href="/financial">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Financial</Button>
                    </Link>
                    <Link href="/payments">
                      <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">Payments</Button>
                    </Link>
                    <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </>
                )}
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={session.user?.image || ''} />
                        <AvatarFallback className="bg-white/20 text-white text-xs">
                          {session.user?.name ? getUserInitials(session.user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {session.user?.name || session.user?.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{session.user?.name || 'User'}</span>
                        <span className="text-sm font-normal text-gray-500">{session.user?.email}</span>
                        <span className="text-xs font-normal text-blue-600 capitalize">{session.user?.role || 'User'}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}