"use client";

import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/wrappers/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { NAV_ITEMS } from "@/lib/navigation";
import { useLocation, useNavigate } from "react-router-dom";
import { Icons } from "@/components/wrappers/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";    
import { useSync } from "@/hooks/useSync";

// Animation timing constants
const ANIMATION_DURATION = "duration-300";
const TRANSITION_EASE = "ease-in-out";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const syncStatus = useSelector((state: RootState) => state.sync.status);
  const lastSynced = useSelector((state: RootState) => state.sync.lastSynced);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { loadInitialData } = useSync();
  const hasData = useSelector((state: RootState) => state.sync.lastSynced !== null);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Panel */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <Icons.x className="h-4 w-4" />
              ) : (
                <Icons.menu className="h-4 w-4" />
              )}
            </Button>
            {/* Logo and title */}
            <div className="flex items-center gap-2">
              <Icons.lifeBuoy className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Life Manager
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Sync Status */}
            <div className="hidden sm:block text-sm text-muted-foreground">
              {syncStatus === "syncing" && (
                <div className="flex items-center gap-2">
                  <Icons.spinner className="h-4 w-4 animate-spin text-primary" />
                  <span>Syncing...</span>
                </div>
              )}
              {syncStatus === "error" && (
                <div className="flex items-center gap-2 text-destructive hover:text-destructive/80 cursor-pointer transition-colors">
                  <Icons.alertCircle className="h-4 w-4" />
                  <span>Sync Error</span>
                </div>
              )}
              {syncStatus === "idle" && lastSynced && (
                <div className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  <span>Last synced: {new Date(lastSynced).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30"
              onClick={() => navigate("/settings")}
            >
              <Icons.settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/30"
            >
              <Icons.logOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={cn(
            "fixed md:sticky top-14 h-[calc(100vh-3.5rem)] border-r bg-background transition-all",
            ANIMATION_DURATION,
            TRANSITION_EASE,
            {
              "w-64 translate-x-0": !sidebarCollapsed && !isMobile,
              "w-16 translate-x-0": sidebarCollapsed && !isMobile,
              "-translate-x-full w-64": !mobileMenuOpen && isMobile,
              "translate-x-0 w-64": mobileMenuOpen && isMobile,
            }
          )}
        >
          <div className="flex h-full flex-col py-4">
            <nav className="space-y-1 px-2">
              {NAV_ITEMS.map((item) => {
                const Icon = Icons[item.icon as keyof typeof Icons];
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all",
                      ANIMATION_DURATION,
                      {
                        "bg-primary/10 text-primary": isActive,
                        "hover:bg-primary/5": !isActive,
                        "justify-center px-0": sidebarCollapsed && !isMobile,
                      }
                    )}
                    size="sm"
                    onClick={() => navigate(item.path)}
                  >
                    <Icon 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        ANIMATION_DURATION,
                        !sidebarCollapsed && "mr-2",
                        isActive && "scale-110"
                      )} 
                    />
                    {(!sidebarCollapsed || isMobile) && item.label}
                  </Button>
                );
              })}
            </nav>
            <div className="mt-auto px-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full hover:bg-primary/5 md:flex",
                  isMobile && "hidden"
                )}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <Icons.chevronRight className="h-4 w-4" />
                ) : (
                  <Icons.chevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 py-6 transition-all",
          ANIMATION_DURATION,
          TRANSITION_EASE
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 