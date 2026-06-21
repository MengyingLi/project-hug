import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useInviteTeammate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invite: { email: string; role: 'admin' | 'member' }) => {
      const { data, error } = await supabase
        .from('team_invites')
        .insert({
          email: invite.email,
          role: invite.role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
    },
  });
}