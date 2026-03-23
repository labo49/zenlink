import { supabase } from '@/lib/supabase';
import type { Link } from '@/lib/types';

export default defineBackground(() => {
  // On browser startup, move on_next_session links back to inbox and open them
  browser.runtime.onStartup.addListener(handleNextSessionLinks);

  // Also check when the extension is first installed/updated
  browser.runtime.onInstalled.addListener(handleNextSessionLinks);

  // Check snoozed links every 5 minutes and wake up any that are due
  browser.alarms.create('snooze-check', { periodInMinutes: 5 });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'snooze-check') handleSnoozedLinks();
  });
});

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function openLinksInTabs(links: Link[]) {
  for (const link of links) {
    await browser.tabs.create({ url: link.url, active: false });
  }
}

async function handleNextSessionLinks() {
  const session = await getSession();
  if (!session) return;

  const { data, error } = await supabase
    .from('links')
    .update({ on_next_session: false })
    .eq('user_id', session.user.id)
    .eq('on_next_session', true)
    .select();

  if (error) {
    console.error('[ZenLink] Failed to wake next-session links:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log(`[ZenLink] Waking ${data.length} next-session link(s).`);
    await openLinksInTabs(data as Link[]);
  }
}

async function handleSnoozedLinks() {
  const session = await getSession();
  if (!session) return;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('links')
    .update({ snoozed_until: null })
    .eq('user_id', session.user.id)
    .not('snoozed_until', 'is', null)
    .lte('snoozed_until', now)
    .select();

  if (error) {
    console.error('[ZenLink] Failed to wake snoozed links:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log(`[ZenLink] Waking ${data.length} snoozed link(s).`);
    await openLinksInTabs(data as Link[]);
  }
}
