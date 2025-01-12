import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { initializeData } from '../../state/syncEngine';
import { Sidebar } from './Sidebar';
import { TopPanel } from './TopPanel';

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Initialize data when the app loads
    initializeData();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onCollapsedChange={setIsCollapsed} 
      />

      {/* Main content area with TopPanel */}
      <div className="flex flex-col flex-1">
        <TopPanel />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
