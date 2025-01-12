import { NavLink } from 'react-router-dom';
import { Home, Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export const Sidebar = ({ isCollapsed, onCollapsedChange }: SidebarProps) => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/weekly-plan', label: 'Weekly Plan', icon: Calendar },
    { path: '/master-list', label: 'Master List', icon: List },
  ];

  return (
    <div
      className={cn(
        'bg-card border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-xl font-bold">Life Manager</span>
          )}
          <Button
            variant="default"
            size="icon"
            onClick={() => onCollapsedChange(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 my-1 rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                  isCollapsed && 'justify-center'
                )
              }
            >
              <Icon size={20} />
              {!isCollapsed && <span className="ml-3">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}; 