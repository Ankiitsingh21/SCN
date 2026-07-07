'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, ChevronLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardSidebarProps {
  items: NavItem[];
  role: 'worker' | 'recruiter' | 'admin';
  isOpen?: boolean;
}

const roleLabels: Record<string, string> = {
  worker: 'Worker Portal',
  recruiter: 'Recruiter Portal',
  admin: 'Admin Panel',
};

const roleHomeRoutes: Record<string, string> = {
  worker: '/worker/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export function DashboardSidebar({ items, role, isOpen = true }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card lg:flex transition-all duration-300", isOpen ? "w-64" : "w-0 border-r-0 overflow-hidden opacity-0")}>
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BriefcaseIcon />
          </div>
          <span className="text-lg font-bold tracking-tight">SCN Jobs</span>
        </Link>
      </div>

      <div className="px-3 py-4">
        <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {roleLabels[role]}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href={roleHomeRoutes[role]}
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{user ? getInitials(user.name) : <User className="h-4 w-4" />}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      className="h-4 w-4 text-primary-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
