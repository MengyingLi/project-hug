import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Comment } from '@/types/issue';
import { useToast } from '@/hooks/use-toast';

export function useComments(issueId: string | null) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      if (!issueId) return [];
      const { data, error } = await supabase
        .from('comments')
        .select(`*, author:profiles(*)`)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!issueId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ issueId, content }: { issueId: string; content: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('comments')
        .insert({
          issue_id: issueId,
          content,
          author_id: user.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.issueId] });
    },
    onError: (error) => {
      toast({ title: 'Failed to add comment', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, issueId }: { id: string; issueId: string }) => {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      return issueId;
    },
    onSuccess: (issueId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete comment', description: error.message, variant: 'destructive' });
    },
  });
}
