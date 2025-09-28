'use client';

import React from 'react';
import { BarChart3, Users, Database, Zap, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      icon: BarChart3,
      label: 'Overview',
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      icon: Users,
      label: 'My Devices',
      href: '/dashboard/devices',
      active: pathname === '/dashboard/devices',
    },
    {
      icon: Database,
      label: 'HCP Database',
      href: '/dashboard/hcp-database',
      active: pathname === '/dashboard/hcp-database',
    },
    {
      icon: Zap,
      label: 'Active Campaigns',
      href: '/dashboard/campaigns',
      active: pathname === '/dashboard/campaigns',
    },
  ];

  const bottomNavItems = [
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard/settings',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/dashboard/help',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-gray-900">Medicus</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 mt-4">
            <img src="/avatar1.jpg" alt="John Doe" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Sales Rep, West</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
