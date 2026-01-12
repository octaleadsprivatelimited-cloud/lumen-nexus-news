import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdPosition = 'header' | 'sidebar' | 'in-article' | 'footer' | 'between-posts';

interface AdSlot {
  id: string;
  name: string;
  slot_id: string;
  position: string;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface AdSlotInsert {
  name: string;
  slot_id: string;
  position: string;
  is_active?: boolean;
}

export const useAdSlots = (position?: AdPosition) => {
  return useQuery({
    queryKey: ['ad-slots', position],
    queryFn: async () => {
      let query = supabase
        .from('ad_slots')
        .select('*')
        .order('created_at', { ascending: false });

      if (position) {
        query = query.eq('position', position).eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdSlot[];
    },
  });
};

export const useActiveAdSlot = (position: AdPosition) => {
  return useQuery({
    queryKey: ['ad-slot', position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as AdSlot | null;
    },
  });
};

export const useCreateAdSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adSlot: AdSlotInsert) => {
      const { data, error } = await supabase
        .from('ad_slots')
        .insert(adSlot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-slots'] });
      queryClient.invalidateQueries({ queryKey: ['ad-slot'] });
    },
  });
};

export const useUpdateAdSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...adSlot }: Partial<AdSlotInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('ad_slots')
        .update(adSlot)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-slots'] });
      queryClient.invalidateQueries({ queryKey: ['ad-slot'] });
    },
  });
};

export const useDeleteAdSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-slots'] });
      queryClient.invalidateQueries({ queryKey: ['ad-slot'] });
    },
  });
};
