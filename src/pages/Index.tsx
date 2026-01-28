import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { BoardView } from '@/components/BoardView';
import { ListView } from '@/components/ListView';
import { TimelineView } from '@/components/TimelineView';
import { FilterBar } from '@/components/FilterBar';
import { CreateIssueDialog } from '@/components/CreateIssueDialog';
import { IssueDetailPanel } from '@/components/IssueDetailPanel';
import { useAuth } from '@/hooks/useAuth';
import { useIssues } from '@/hooks/useIssues';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ViewType, IssueFilters, Issue } from '@/types/issue';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [filters, setFilters] = useState<IssueFilters>({});
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: issues = [], isLoading: issuesLoading } = useIssues({
    ...filters,
    search: search || undefined,
  });

  useKeyboardShortcuts({
    onCreateIssue: () => setCreateDialogOpen(true),
    onSearch: () => searchRef.current?.focus(),
  });

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssueId(issue.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateIssue={() => setCreateDialogOpen(true)}
        onSearch={() => searchRef.current?.focus()}
        searchRef={searchRef}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <FilterBar filters={filters} onFiltersChange={setFilters} />

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">
            {issuesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : currentView === 'board' ? (
              <BoardView issues={issues} onIssueClick={handleIssueClick} />
            ) : currentView === 'list' ? (
              <ListView
                issues={issues}
                onIssueClick={handleIssueClick}
                selectedIssueId={selectedIssueId}
              />
            ) : (
              <TimelineView issues={issues} onIssueClick={handleIssueClick} />
            )}
          </div>

          {selectedIssueId && (
            <IssueDetailPanel
              issueId={selectedIssueId}
              onClose={() => setSelectedIssueId(null)}
            />
          )}
        </div>
      </div>

      <CreateIssueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Index;
