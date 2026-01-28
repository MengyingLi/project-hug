import { useMemo } from 'react';
import { startOfWeek, addDays, format, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PRIORITY_CONFIG, STATUS_CONFIG, type Issue } from '@/types/issue';

interface TimelineViewProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

export function TimelineView({ issues, onIssueClick }: TimelineViewProps) {
  const today = new Date();
  const startDate = startOfWeek(today);
  
  // Generate 8 weeks of dates
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let w = 0; w < 8; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(startDate, w * 7 + d));
      }
      result.push(week);
    }
    return result;
  }, [startDate]);

  const allDates = weeks.flat();

  // Filter issues with due dates
  const issuesWithDates = issues.filter((issue) => issue.due_date);

  const getIssuePosition = (issue: Issue) => {
    if (!issue.due_date) return null;
    const dueDate = parseISO(issue.due_date);
    const daysDiff = differenceInDays(dueDate, allDates[0]);
    if (daysDiff < 0 || daysDiff >= allDates.length) return null;
    return daysDiff;
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 min-w-max">
        {/* Header with dates */}
        <div className="flex mb-4">
          <div className="w-64 shrink-0" />
          <div className="flex">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex">
                {week.map((day, dayIndex) => {
                  const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "w-10 text-center text-xs",
                        isToday && "font-bold text-primary"
                      )}
                    >
                      <div className="text-muted-foreground">{format(day, 'EEE')}</div>
                      <div className={cn(
                        "w-6 h-6 mx-auto flex items-center justify-center rounded-full",
                        isToday && "bg-primary text-primary-foreground"
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div className="space-y-2">
          {issuesWithDates.map((issue) => {
            const position = getIssuePosition(issue);
            if (position === null) return null;

            const priorityConfig = PRIORITY_CONFIG[issue.priority];
            const statusConfig = STATUS_CONFIG[issue.status];

            return (
              <div key={issue.id} className="flex items-center">
                <div
                  className="w-64 shrink-0 pr-4 cursor-pointer hover:bg-muted/50 rounded p-2"
                  onClick={() => onIssueClick(issue)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {issue.identifier}
                    </span>
                    <span className={priorityConfig.color}>{priorityConfig.icon}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{issue.title}</p>
                </div>
                <div className="flex relative h-8" style={{ width: allDates.length * 40 }}>
                  {/* Today line */}
                  {allDates.findIndex(d => format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-primary/30 z-0"
                      style={{
                        left: allDates.findIndex(d => format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) * 40 + 20,
                      }}
                    />
                  )}
                  {/* Issue marker */}
                  <div
                    className={cn(
                      "absolute top-1 h-6 rounded flex items-center px-2 text-xs cursor-pointer hover:opacity-80",
                      statusConfig.color,
                      "text-white"
                    )}
                    style={{
                      left: position * 40,
                      minWidth: 80,
                    }}
                    onClick={() => onIssueClick(issue)}
                  >
                    <span className="truncate">{issue.title}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {issuesWithDates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No issues with due dates to display on timeline
            </div>
          )}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
