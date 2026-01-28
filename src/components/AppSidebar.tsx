import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  List, 
  Calendar, 
  Inbox, 
  Settings, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Tag,
  Users,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useCycles } from '@/hooks/useCycles';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useProfiles';
import type { ViewType } from '@/types/issue';

interface AppSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCreateIssue: () => void;
  onSearch: () => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  search: string;
  onSearchChange: (search: string) => void;
}

export function AppSidebar({ 
  currentView, 
  onViewChange, 
  onCreateIssue, 
  onSearch,
  searchRef,
  search,
  onSearchChange
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: cycles } = useCycles();
  const { signOut } = useAuth();
  const { data: profile } = useCurrentProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    { icon: LayoutGrid, label: 'Board', view: 'board' as ViewType, path: '/' },
    { icon: List, label: 'List', view: 'list' as ViewType, path: '/' },
    { icon: Calendar, label: 'Timeline', view: 'timeline' as ViewType, path: '/' },
  ];

  const activeCycle = cycles?.find(c => {
    if (!c.start_date || !c.end_date) return false;
    const now = new Date();
    return new Date(c.start_date) <= now && new Date(c.end_date) >= now;
  });

  return (
    <div className={cn(
      "flex flex-col border-r bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IT</span>
            </div>
            <span className="font-semibold">Issue Tracker</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search issues... (/)"
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearch}
            />
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="px-4 pb-4">
        <Button 
          onClick={onCreateIssue} 
          className={cn("w-full", collapsed && "px-0")}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Create Issue (C)</span>}
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Views */}
          <div className="mb-4">
            {!collapsed && (
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Views
              </p>
            )}
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant={currentView === item.view ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mb-1",
                  collapsed && "justify-center px-0"
                )}
                onClick={() => onViewChange(item.view)}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Quick Access */}
          <div className="mb-4">
            {!collapsed && (
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Access
              </p>
            )}
            <Button
              variant={location.pathname === '/inbox' ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1",
                collapsed && "justify-center px-0"
              )}
              onClick={() => navigate('/inbox')}
            >
              <Inbox className="h-4 w-4" />
              {!collapsed && (
                <>
                  <span className="ml-2 flex-1 text-left">Inbox</span>
                  {unreadCount && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && unreadCount && unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={location.pathname === '/cycles' ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1",
                collapsed && "justify-center px-0"
              )}
              onClick={() => navigate('/cycles')}
            >
              <Repeat className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Cycles</span>}
            </Button>
          </div>

          {!collapsed && activeCycle && (
            <>
              <Separator className="my-2" />
              <div className="mb-4">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Cycle
                </p>
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{activeCycle.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeCycle.start_date} - {activeCycle.end_date}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className={cn(
          "flex items-center gap-2",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
