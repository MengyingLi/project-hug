import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { PRIORITY_CONFIG, STATUS_CONFIG, type Issue } from '@/types/issue';

interface ListViewProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  selectedIssueId?: string | null;
}

export function ListView({ issues, onIssueClick, selectedIssueId }: ListViewProps) {
  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-32">Priority</TableHead>
            <TableHead className="w-40">Assignee</TableHead>
            <TableHead className="w-32">Due Date</TableHead>
            <TableHead className="w-32">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => {
            const priorityConfig = PRIORITY_CONFIG[issue.priority];
            const statusConfig = STATUS_CONFIG[issue.status];

            return (
              <TableRow
                key={issue.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  selectedIssueId === issue.id && "bg-muted"
                )}
                onClick={() => onIssueClick(issue)}
              >
                <TableCell>
                  <Checkbox onClick={(e) => e.stopPropagation()} />
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {issue.identifier}
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {issue.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1">
                    <div className={cn("h-2 w-2 rounded-full", statusConfig.color)} />
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn("flex items-center gap-1", priorityConfig.color)}>
                    {priorityConfig.icon} {priorityConfig.label}
                  </span>
                </TableCell>
                <TableCell>
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={issue.assignee.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {issue.assignee.full_name?.charAt(0) || issue.assignee.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {issue.assignee.full_name || issue.assignee.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {issue.due_date ? (
                    <span className="text-sm">
                      {format(new Date(issue.due_date), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(issue.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            );
          })}
          {issues.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No issues found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
