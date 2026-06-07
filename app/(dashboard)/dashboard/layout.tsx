'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/dashboard/customers', icon: Users },
    { name: 'Jobs', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'Quotes', path: '/dashboard/quotes', icon: FileText },
    { name: 'Invoices', path: '/dashboard/invoices', icon: Receipt },
    { name: 'Activity', path: '/dashboard/activity', icon: Activity },
    { name: 'Account Settings', path: '/dashboard/account-settings', icon: Settings },
  ];

  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const showNotificationBell = pathname !== '/dashboard/activity';

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    closeMobileMenu();
    await signOut({ redirect: false });
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans overflow-x-hidden">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 px-4 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/#hero" onClick={closeMobileMenu}>
          <Image
            src="/images/workforceflowailogo2.png"
            alt="Revoostai logo"
            width={180}
            height={100}
            className="object-contain"
          />
        </Link>
      </header>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-[84vw] max-w-72 lg:w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40 lg:z-10 transform transition-transform duration-200 ${
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 border-b border-slate-100">
          <Link
            href={"/#hero"}
            className="relative w-[180px] h-[90px]"
            onClick={closeMobileMenu}
          >
            <Image
              src="/images/workforceflowailogo2.png"
              alt="Revoostai logo"
              fill
              className="object-contain"
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#22d3ee] text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-slate-200">
          <Link
            href="/dashboard/account-settings"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg hover:bg-slate-50"
          >
            <div className="w-8 h-8 rounded-full bg-[#22d3ee] flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || ''}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            {isSigningOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0 lg:ml-64">
        {showNotificationBell && (
          <div className="mb-4 flex justify-end">
            <NotificationBell />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
