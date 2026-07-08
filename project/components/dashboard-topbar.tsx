'use client';

import Link from 'next/link';
import { Bell, LogOut, Menu, PanelLeftClose, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavItem } from '@/components/dashboard-sidebar';
import { useAuth } from '@/lib/auth-context';
import { getInitials } from '@/lib/format';

interface DashboardTopbarProps {
  items: NavItem[];
  role: 'worker' | 'recruiter' | 'admin';
  title: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function DashboardTopbar({ role, title, sidebarOpen, onToggleSidebar }: DashboardTopbarProps) {
  const { user, logout } = useAuth();
  const unreadCount = 0;

  const profileRoute = role === 'worker' ? '/worker/profile' : role === 'recruiter' ? '/recruiter/dashboard' : null;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-3 text-sm text-muted-foreground">
                No notifications yet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {user ? getInitials(user.name) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profileRoute && (
                <DropdownMenuItem asChild>
                  <Link href={profileRoute}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
              )}
              {profileRoute && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
