"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, List } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/home",
    className: "sidebar-icon home"
  },
  {
    label: "Weekly Plan",
    icon: Calendar,
    href: "/weekly-plan",
    className: "sidebar-icon weekly"
  },
  {
    label: "Master List",
    icon: List,
    href: "/master-list",
    className: "sidebar-icon master"
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar flex h-full flex-col overflow-y-auto">
      <div className="flex flex-col gap-4 p-6">
        <Link href="/home" className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">
            Life Manager
          </h1>
        </Link>
        <div className="flex flex-col gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === route.href 
                  ? "bg-[#00AEFF]/10 text-[--text-primary]" 
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[#00AEFF]/5"
              )}
            >
              <route.icon className={route.className} />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 