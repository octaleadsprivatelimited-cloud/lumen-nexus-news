import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PingRecord {
  id: string;
  pinged_at: string;
  status: string;
  response_time_ms: number | null;
  error_message: string | null;
}

export const useLastPing = () => {
  return useQuery({
    queryKey: ['last-ping'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supabase_pings')
        .select('*')
        .order('pinged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PingRecord | null;
    },
  });
};

export const usePingHistory = (limit = 10) => {
  return useQuery({
    queryKey: ['ping-history', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supabase_pings')
        .select('*')
        .order('pinged_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PingRecord[];
    },
  });
};

export const useManualPing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('keep-alive');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['last-ping'] });
      queryClient.invalidateQueries({ queryKey: ['ping-history'] });
    },
  });
};
