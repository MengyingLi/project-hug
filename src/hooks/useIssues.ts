import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Issue, IssueFilters, IssuePriority, IssueStatus } from '@/types/issue';
import { useToast } from '@/hooks/use-toast';

export function useIssues(filters?: IssueFilters) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: async () => {
      let query = supabase
        .from('issues')
        .select(`
          *,
          assignee:profiles!issues_assignee_id_fkey(*),
          reporter:profiles!issues_reporter_id_fkey(*),
          cycle:cycles(*)
        `)
        .order('sort_order', { ascending: true });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id);
      }
      if (filters?.cycle_id) {
        query = query.eq('cycle_id', filters.cycle_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,identifier.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Issue[];
    },
  });
}

export function useIssue(id: string | null) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          assignee:profiles!issues_assignee_id_fkey(*),
          reporter:profiles!issues_reporter_id_fkey(*),
          cycle:cycles(*)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Issue | null;
    },
    enabled: !!id,
  });
}

export function useIssueLabels(issueId: string | null) {
  return useQuery({
    queryKey: ['issue-labels', issueId],
    queryFn: async () => {
      if (!issueId) return [];
      const { data, error } = await supabase
        .from('issue_labels')
        .select('label_id, labels(*)')
        .eq('issue_id', issueId);
      if (error) throw error;
      return data.map(d => d.labels).filter(Boolean);
    },
    enabled: !!issueId,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (issue: {
      title: string;
      description?: string;
      priority?: IssuePriority;
      status?: IssueStatus;
      assignee_id?: string | null;
      cycle_id?: string | null;
      due_date?: string | null;
      estimate?: number | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('issues')
        .insert({
          ...issue,
          reporter_id: user.user?.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Issue created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create issue', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Issue> & { id: string }) => {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', data.id] });
    },
    onError: (error) => {
      toast({ title: 'Failed to update issue', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('issues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast({ title: 'Issue deleted' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete issue', description: error.message, variant: 'destructive' });
    },
  });
}
