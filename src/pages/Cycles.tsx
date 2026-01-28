import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInDays } from 'date-fns';
import { Plus, Calendar, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/hooks/useAuth';
import { useCycles, useCreateCycle, useDeleteCycle } from '@/hooks/useCycles';
import { useIssues } from '@/hooks/useIssues';
import { AppSidebar } from '@/components/AppSidebar';
import type { ViewType, Cycle } from '@/types/issue';

const cycleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type CycleForm = z.infer<typeof cycleSchema>;

export default function CyclesPage() {
  const { user, loading } = useAuth();
  const { data: cycles, isLoading } = useCycles();
  const { data: allIssues } = useIssues();
  const createCycle = useCreateCycle();
  const deleteCycle = useDeleteCycle();
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const form = useForm<CycleForm>({
    resolver: zodResolver(cycleSchema),
    defaultValues: { name: '', description: '' },
  });

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

  const handleCreateCycle = async (data: CycleForm) => {
    await createCycle.mutateAsync({
      name: data.name,
      description: data.description,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    });
    form.reset();
    setStartDate(undefined);
    setEndDate(undefined);
    setCreateDialogOpen(false);
  };

  const getCycleProgress = (cycle: Cycle) => {
    const issues = allIssues?.filter((i) => i.cycle_id === cycle.id) || [];
    if (issues.length === 0) return 0;
    const completed = issues.filter((i) => i.status === 'done').length;
    return Math.round((completed / issues.length) * 100);
  };

  const getCycleStatus = (cycle: Cycle) => {
    const now = new Date();
    if (!cycle.start_date || !cycle.end_date) return 'unscheduled';
    const start = new Date(cycle.start_date);
    const end = new Date(cycle.end_date);
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Cycles</h1>
              <p className="text-muted-foreground">
                Plan and track your sprints
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Cycle
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : cycles?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No cycles yet</CardTitle>
                <CardDescription className="mb-4">
                  Create your first cycle to start planning sprints.
                </CardDescription>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cycle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cycles?.map((cycle) => {
                const status = getCycleStatus(cycle);
                const progress = getCycleProgress(cycle);
                const issueCount = allIssues?.filter((i) => i.cycle_id === cycle.id).length || 0;
                const daysRemaining = cycle.end_date
                  ? differenceInDays(new Date(cycle.end_date), new Date())
                  : null;

                return (
                  <Card key={cycle.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {cycle.name}
                            <Badge
                              variant={
                                status === 'active'
                                  ? 'default'
                                  : status === 'upcoming'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {status}
                            </Badge>
                          </CardTitle>
                          {cycle.description && (
                            <CardDescription className="mt-1">
                              {cycle.description}
                            </CardDescription>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Cycle?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the cycle but keep all issues. Issues will become unassigned to any cycle.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCycle.mutate(cycle.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {cycle.start_date && cycle.end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(cycle.start_date), 'MMM d')} -{' '}
                            {format(new Date(cycle.end_date), 'MMM d, yyyy')}
                          </div>
                        )}
                        <span>{issueCount} issues</span>
                        {daysRemaining !== null && daysRemaining > 0 && status === 'active' && (
                          <span>{daysRemaining} days remaining</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Cycle</DialogTitle>
            <DialogDescription>
              Create a new cycle to plan and track a sprint.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleCreateCycle)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Sprint 1"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will this cycle focus on?"
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCycle.isPending}>
                {createCycle.isPending ? 'Creating...' : 'Create Cycle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
