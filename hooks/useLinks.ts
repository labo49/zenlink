import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInboxLinks, fetchSnoozedLinks, saveLink, deleteLink, snoozeLink, searchLinks } from '@/lib/links';
import type { NewLink, SnoozeOption } from '@/lib/types';

function snoozeDate(option: SnoozeOption): { snoozed_until: string | null; on_next_session: boolean } {
  const now = new Date();

  if (option === 'next_session') {
    return { snoozed_until: null, on_next_session: true };
  }

  if (option === '4weeks') {
    const d = new Date(now);
    d.setDate(d.getDate() + 28);
    d.setHours(9, 0, 0, 0);
    return { snoozed_until: d.toISOString(), on_next_session: false };
  }

  // Next friday or monday at 09:00
  const target = option === 'friday' ? 5 : 1;
  const d = new Date(now);
  const day = d.getDay();
  const diff = (target - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(9, 0, 0, 0);
  return { snoozed_until: d.toISOString(), on_next_session: false };
}

export function useInboxLinks(userId: string) {
  return useQuery({
    queryKey: ['links', 'inbox', userId],
    queryFn: () => fetchInboxLinks(userId),
  });
}

export function useSnoozedLinks(userId: string) {
  return useQuery({
    queryKey: ['links', 'snoozed', userId],
    queryFn: () => fetchSnoozedLinks(userId),
  });
}

export function useSearchLinks(userId: string, query: string) {
  return useQuery({
    queryKey: ['links', 'search', userId, query],
    queryFn: () => searchLinks(userId, query),
    enabled: query.trim().length > 1,
  });
}

export function useSaveLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (link: NewLink) => saveLink(link),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['links', 'inbox', vars.user_id] });
    },
  });
}

export function useDeleteLink(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', 'inbox', userId] });
      queryClient.invalidateQueries({ queryKey: ['links', 'snoozed', userId] });
    },
  });
}

export function useSnoozeLink(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, option }: { id: string; option: SnoozeOption }) => {
      const { snoozed_until, on_next_session } = snoozeDate(option);
      return snoozeLink(id, snoozed_until, on_next_session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', 'inbox', userId] });
      queryClient.invalidateQueries({ queryKey: ['links', 'snoozed', userId] });
    },
  });
}
