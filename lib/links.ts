import { supabase } from './supabase';
import type { Link, NewLink } from './types';

export async function fetchInboxLinks(userId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .eq('on_next_session', false)
    .is('snoozed_until', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchSnoozedLinks(userId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .or('snoozed_until.not.is.null,on_next_session.eq.true')
    .order('snoozed_until', { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveLink(link: NewLink): Promise<Link> {
  const { data, error } = await supabase
    .from('links')
    .insert(link)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) throw error;
}

export async function snoozeLink(
  id: string,
  snoozedUntil: string | null,
  onNextSession: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('links')
    .update({ snoozed_until: snoozedUntil, on_next_session: onNextSession })
    .eq('id', id);
  if (error) throw error;
}

export async function importLinks(links: NewLink[]): Promise<number> {
  const { data, error } = await supabase.from('links').insert(links).select('id');
  if (error) throw error;
  return data.length;
}

export async function searchLinks(userId: string, query: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .textSearch('fts', query, { type: 'websearch' })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
