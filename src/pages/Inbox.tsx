import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell, Check, CheckCheck, Inbox as InboxIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { AppSidebar } from '@/components/AppSidebar';
import { useState } from 'react';
import type { ViewType } from '@/types/issue';

export default function InboxPage() {
  const { user, loading } = useAuth();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const unreadNotifications = notifications?.filter((n) => !n.read) || [];
  const readNotifications = notifications?.filter((n) => n.read) || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'issue_assigned':
        return '👤';
      case 'comment_added':
        return '💬';
      case 'status_changed':
        return '🔄';
      case 'priority_changed':
        return '⚡';
      default:
        return '📢';
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateIssue={() => {}}
        onSearch={() => {}}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <InboxIcon className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-muted-foreground">
                  {unreadNotifications.length} unread notifications
                </p>
              </div>
            </div>
            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : notifications?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No notifications yet</CardTitle>
                <CardDescription>
                  You'll be notified when there's activity on your issues.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {unreadNotifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">Unread</h2>
                  <div className="space-y-2">
                    {unreadNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={cn(
                          "cursor-pointer hover:bg-accent/50 transition-colors",
                          "border-l-4 border-l-primary"
                        )}
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{notification.message}</p>
                              {notification.issue && (
                                <Badge variant="outline" className="mt-1">
                                  {notification.issue.identifier}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {readNotifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">Earlier</h2>
                  <div className="space-y-2">
                    {readNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className="hover:bg-accent/50 transition-colors opacity-70"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{notification.message}</p>
                              {notification.issue && (
                                <Badge variant="outline" className="mt-1">
                                  {notification.issue.identifier}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
