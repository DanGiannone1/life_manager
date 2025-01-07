import { useSync } from '@/hooks/useSync';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SyncIndicator() {
  const { syncStatus, lastSynced, pendingChanges } = useSync();

  const getStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center text-yellow-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Syncing changes...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-500">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Sync error</span>
          </div>
        );
      case 'idle':
        if (pendingChanges > 0) {
          return (
            <div className="flex items-center text-yellow-500">
              <span>{pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'}</span>
            </div>
          );
        }
        return (
          <div className="flex items-center text-green-500">
            <Check className="w-4 h-4 mr-2" />
            <span>All changes saved</span>
            {lastSynced && (
              <span className="ml-2 text-sm text-gray-500">
                {new Date(lastSynced).toLocaleTimeString()}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-md',
        'transition-colors duration-200',
        'flex items-center justify-center',
        'min-w-[200px]'
      )}
    >
      {getStatusDisplay()}
    </div>
  );
}

// Example usage in TopPanel:
/*
function TopPanel() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Life Manager</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <SyncIndicator />
        <SettingsButton />
        <LogoutButton />
      </div>
    </div>
  );
}
*/ 