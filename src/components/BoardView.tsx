import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BoardColumn } from './BoardColumn';
import { IssueCard } from './IssueCard';
import { useUpdateIssue } from '@/hooks/useIssues';
import type { Issue, IssueStatus, STATUSES, STATUS_CONFIG } from '@/types/issue';

interface BoardViewProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

export function BoardView({ issues, onIssueClick }: BoardViewProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const updateIssue = useUpdateIssue();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const columns: IssueStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];

  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };

    issues.forEach((issue) => {
      grouped[issue.status].push(issue);
    });

    return grouped;
  }, [issues]);

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    setActiveIssue(issue || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeIssue = issues.find((i) => i.id === active.id);
    if (!activeIssue) return;

    // Check if dropped on a column
    const newStatus = columns.find((col) => col === over.id);
    if (newStatus && newStatus !== activeIssue.status) {
      updateIssue.mutate({ id: activeIssue.id, status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-full w-full">
        <div className="flex gap-4 p-4 min-w-max">
          {columns.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              issues={issuesByStatus[status]}
              onIssueClick={onIssueClick}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeIssue && (
          <IssueCard issue={activeIssue} onClick={() => {}} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  );
}
