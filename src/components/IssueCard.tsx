import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PRIORITY_CONFIG, type Issue } from '@/types/issue';
import { format } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  isDragging?: boolean;
}

export function IssueCard({ issue, onClick, isDragging }: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[issue.priority];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:bg-accent/50 transition-colors group",
        (isDragging || isSorting) && "opacity-50 shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity mt-0.5"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground font-mono">
                {issue.identifier}
              </span>
              <span className={cn("text-sm", priorityConfig.color)}>
                {priorityConfig.icon}
              </span>
            </div>
            
            <h3 className="font-medium text-sm line-clamp-2 mb-2">
              {issue.title}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {issue.due_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(issue.due_date), 'MMM d')}
                </div>
              )}
              
              {issue.estimate && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {issue.estimate}pt
                </Badge>
              )}

              <div className="flex-1" />

              {issue.assignee && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={issue.assignee.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {issue.assignee.full_name?.charAt(0) || issue.assignee.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
