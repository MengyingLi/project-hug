import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Label } from '@/types/issue';
import { useToast } from '@/hooks/use-toast';

export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Label[];
    },
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

export function useCreateLabel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (label: { name: string; color: string; description?: string }) => {
      const { data, error } = await supabase
        .from('labels')
        .insert(label)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({ title: 'Label created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create label', description: error.message, variant: 'destructive' });
    },
  });
}

export function useToggleIssueLabel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ issueId, labelId, hasLabel }: { issueId: string; labelId: string; hasLabel: boolean }) => {
      if (hasLabel) {
        const { error } = await supabase
          .from('issue_labels')
          .delete()
          .eq('issue_id', issueId)
          .eq('label_id', labelId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('issue_labels')
          .insert({ issue_id: issueId, label_id: labelId });
        if (error) throw error;
      }
      return issueId;
    },
    onSuccess: (issueId) => {
      queryClient.invalidateQueries({ queryKey: ['issue-labels', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to update labels', description: error.message, variant: 'destructive' });
    },
  });
}
