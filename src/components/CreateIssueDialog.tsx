import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCreateIssue } from '@/hooks/useIssues';
import { useProfiles } from '@/hooks/useProfiles';
import { useCycles } from '@/hooks/useCycles';
import { PRIORITIES, STATUSES, PRIORITY_CONFIG, STATUS_CONFIG, type IssuePriority, type IssueStatus } from '@/types/issue';

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none'] as const),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'] as const),
  assignee_id: z.string().nullable(),
  cycle_id: z.string().nullable(),
  estimate: z.number().nullable(),
});

type CreateIssueForm = z.infer<typeof createIssueSchema>;

interface CreateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIssueDialog({ open, onOpenChange }: CreateIssueDialogProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const createIssue = useCreateIssue();
  const { data: profiles } = useProfiles();
  const { data: cycles } = useCycles();

  const form = useForm<CreateIssueForm>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'none',
      status: 'backlog',
      assignee_id: null,
      cycle_id: null,
      estimate: null,
    },
  });

  const onSubmit = async (data: CreateIssueForm) => {
    await createIssue.mutateAsync({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      assignee_id: data.assignee_id,
      cycle_id: data.cycle_id,
      estimate: data.estimate,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
    });
    form.reset();
    setDueDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Issue</DialogTitle>
          <DialogDescription>
            Create a new issue to track work. Press C anytime to open this dialog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Issue title..."
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue..."
              className="min-h-[100px]"
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as IssueStatus)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as IssuePriority)}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={form.watch('assignee_id') || 'unassigned'}
                onValueChange={(value) => form.setValue('assignee_id', value === 'unassigned' ? null : value)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Cycle</Label>
              <Select
                value={form.watch('cycle_id') || 'no-cycle'}
                onValueChange={(value) => form.setValue('cycle_id', value === 'no-cycle' ? null : value)}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Estimate (points)</Label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                onChange={(e) => form.setValue('estimate', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createIssue.isPending}>
              {createIssue.isPending ? 'Creating...' : 'Create Issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
