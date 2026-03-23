export interface Link {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  favicon: string | null;
  tags: string[];
  snoozed_until: string | null;
  on_next_session: boolean;
  created_at: string;
}

export type NewLink = Omit<Link, 'id' | 'created_at'>;

export type SnoozeOption = 'friday' | 'monday' | '4weeks' | 'next_session' | 'custom';

export interface SnoozeSelection {
  option: SnoozeOption;
  customDate?: string; // ISO string, only used when option === 'custom'
}
