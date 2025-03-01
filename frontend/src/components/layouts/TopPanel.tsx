import { useSelector } from 'react-redux';
import { Check, Loader2, AlertCircle, Settings, LogIn } from 'lucide-react';
import { RootState } from '../../state/syncEngine';
import { Button } from '../ui/button';

export function TopPanel() {
    const syncStatus = useSelector((state: RootState) => state.sync.status);
    const lastSynced = useSelector((state: RootState) => state.sync.lastSynced);

    const renderSyncStatus = () => {
        switch (syncStatus) {
            case 'syncing':
                return (
                    <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Syncing...</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center text-destructive">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>Sync error</span>
                    </div>
                );
            case 'idle':
                return (
                    <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-emerald-500" />
                        <span className="text-foreground whitespace-nowrap">
                            {lastSynced
                                ? `Last saved at ${new Date(lastSynced).toLocaleTimeString()}`
                                : 'All changes saved'}
                        </span>
                    </div>
                );
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="mx-8">
                <div className="flex h-14 items-center justify-end">
                    {/* Right Side Controls */}
                    <div className="flex items-center gap-6">
                        {/* Sync Status */}
                        <div className="flex-shrink-0">
                            {renderSyncStatus()}
                        </div>

                        {/* Settings Button - Inactive for now */}
                        <Button
                            variant="default"
                            size="sm"
                            aria-label="Settings (coming soon)"
                            title="Settings"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>

                        {/* Login/Logout Button - Inactive for now */}
                        <Button
                            variant="default"
                            size="sm"
                            aria-label="Login (coming soon)"
                            title="Logout"
                        >
                            <LogIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
} 