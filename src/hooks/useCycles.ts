import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Cycle } from '@/types/issue';
import { useToast } from '@/hooks/use-toast';

export function useCycles() {
  return useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as Cycle[];
    },
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cycle: {
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('cycles')
        .insert({
          ...cycle,
          created_by: user.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      toast({ title: 'Cycle created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create cycle', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cycle> & { id: string }) => {
      const { data, error } = await supabase
        .from('cycles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to update cycle', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCycle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cycles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      toast({ title: 'Cycle deleted' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete cycle', description: error.message, variant: 'destructive' });
    },
  });
}
