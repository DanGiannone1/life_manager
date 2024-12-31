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
    color: "text-sky-500",
  },
  {
    label: "Weekly Plan",
    icon: Calendar,
    href: "/weekly-plan",
    color: "text-violet-500",
  },
  {
    label: "Master List",
    icon: List,
    href: "/master-list",
    color: "text-pink-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-zinc-900">
      <div className="flex flex-col gap-4 p-6">
        <Link href="/home" className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-white">
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
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              )}
            >
              <route.icon className={cn("h-5 w-5", route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 