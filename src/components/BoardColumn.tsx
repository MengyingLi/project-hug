import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { IssueCard } from './IssueCard';
import { STATUS_CONFIG, type Issue, type IssueStatus } from '@/types/issue';

interface BoardColumnProps {
  status: IssueStatus;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

export function BoardColumn({ status, issues, onIssueClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = STATUS_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-72 min-h-[500px] rounded-lg bg-muted/30 transition-colors",
        isOver && "bg-muted/60"
      )}
    >
      <div className="flex items-center gap-2 p-3 border-b">
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        <span className="font-medium text-sm">{config.label}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {issues.length}
        </span>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        <SortableContext
          items={issues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
            />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
            No issues
          </div>
        )}
      </div>
    </div>
  );
}
