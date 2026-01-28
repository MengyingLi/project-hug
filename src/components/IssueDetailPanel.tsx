import { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, User, Tag, Repeat, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useIssue, useUpdateIssue, useDeleteIssue } from '@/hooks/useIssues';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useProfiles } from '@/hooks/useProfiles';
import { useCycles } from '@/hooks/useCycles';
import { useLabels, useIssueLabels, useToggleIssueLabel } from '@/hooks/useLabels';
import { PRIORITIES, STATUSES, PRIORITY_CONFIG, STATUS_CONFIG, type IssuePriority, type IssueStatus } from '@/types/issue';

interface IssueDetailPanelProps {
  issueId: string;
  onClose: () => void;
}

export function IssueDetailPanel({ issueId, onClose }: IssueDetailPanelProps) {
  const [newComment, setNewComment] = useState('');
  const { data: issue, isLoading } = useIssue(issueId);
  const { data: comments } = useComments(issueId);
  const { data: issueLabels } = useIssueLabels(issueId);
  const { data: allLabels } = useLabels();
  const { data: profiles } = useProfiles();
  const { data: cycles } = useCycles();
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const toggleLabel = useToggleIssueLabel();

  if (isLoading || !issue) {
    return (
      <div className="w-96 border-l bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await createComment.mutateAsync({ issueId, content: newComment });
    setNewComment('');
  };

  const handleDelete = async () => {
    await deleteIssue.mutateAsync(issueId);
    onClose();
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground">{issue.identifier}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Issue?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the issue and all its comments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Title */}
          <div>
            <Input
              value={issue.title}
              onChange={(e) => updateIssue.mutate({ id: issueId, title: e.target.value })}
              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
            <Textarea
              value={issue.description || ''}
              onChange={(e) => updateIssue.mutate({ id: issueId, description: e.target.value })}
              placeholder="Add a description..."
              className="min-h-[100px]"
            />
          </div>

          <Separator />

          {/* Properties */}
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-24">Status</span>
              <Select
                value={issue.status}
                onValueChange={(value) => updateIssue.mutate({ id: issueId, status: value as IssueStatus })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[status].color)} />
                        {STATUS_CONFIG[status].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-24">Priority</span>
              <Select
                value={issue.priority}
                onValueChange={(value) => updateIssue.mutate({ id: issueId, priority: value as IssuePriority })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center gap-2">
                        <span>{PRIORITY_CONFIG[priority].icon}</span>
                        {PRIORITY_CONFIG[priority].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-24">Assignee</span>
              <Select
                value={issue.assignee_id || 'unassigned'}
                onValueChange={(value) => updateIssue.mutate({ id: issueId, assignee_id: value === 'unassigned' ? null : value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cycle */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-24">Cycle</span>
              <Select
                value={issue.cycle_id || 'no-cycle'}
                onValueChange={(value) => updateIssue.mutate({ id: issueId, cycle_id: value === 'no-cycle' ? null : value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="No cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-cycle">No cycle</SelectItem>
                  {cycles?.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Labels */}
            <div>
              <span className="text-sm font-medium text-muted-foreground mb-2 block">Labels</span>
              <div className="flex flex-wrap gap-2">
                {allLabels?.map((label) => {
                  const hasLabel = issueLabels?.some((l: any) => l.id === label.id);
                  return (
                    <Badge
                      key={label.id}
                      variant={hasLabel ? "default" : "outline"}
                      className="cursor-pointer"
                      style={hasLabel ? { backgroundColor: label.color } : {}}
                      onClick={() => toggleLabel.mutate({ issueId, labelId: label.id, hasLabel: !!hasLabel })}
                    >
                      {label.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium mb-4">Comments</h3>
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatar_url || undefined} />
                    <AvatarFallback>
                      {comment.author?.full_name?.charAt(0) || comment.author?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {comment.author?.full_name || comment.author?.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-muted-foreground">
        Created {format(new Date(issue.created_at), 'PPP')}
        {issue.reporter && ` by ${issue.reporter.full_name || issue.reporter.email}`}
      </div>
    </div>
  );
}
