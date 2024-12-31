"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  RepeatIcon, 
  CheckSquare,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/recurring', label: 'Recurring Tasks', icon: RepeatIcon },
  { href: '/one-time', label: 'One-time Tasks', icon: CheckSquare },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      'flex flex-col border-r border-gray-200 bg-white transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && <span className="text-xl font-bold">Life Manager</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100',
                pathname === item.href && 'bg-gray-100 text-gray-900'
              )}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 