'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardTopbar } from '@/components/dashboard-topbar';
import { NavItem } from '@/components/dashboard-sidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  items: NavItem[];
  role: 'worker' | 'recruiter' | 'admin';
  title: string;
}

export function DashboardLayout({ children, items, role, title }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, isLoading, role, router, user]);

  if (isLoading || !isAuthenticated || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={items} role={role} isOpen={sidebarOpen} />
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      <div 
        className="flex flex-1 flex-col overflow-hidden" 
        onClick={() => {
          if (sidebarOpen) setSidebarOpen(false);
        }}
      >
        <DashboardTopbar items={items} role={role} title={title} onToggleSidebar={(e) => {
          e?.stopPropagation();
          setSidebarOpen(!sidebarOpen);
        }} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
