import { supabase } from '@/lib/supabase';

export default defineBackground(() => {
  // On browser startup, move on_next_session links back to inbox
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

async function handleNextSessionLinks() {
  const session = await getSession();
  if (!session) return;

  const { error } = await supabase
    .from('links')
    .update({ on_next_session: false })
    .eq('user_id', session.user.id)
    .eq('on_next_session', true);

  if (error) console.error('[ZenLink] Failed to wake next-session links:', error.message);
  else console.log('[ZenLink] Next-session links moved to inbox.');
}

async function handleSnoozedLinks() {
  const session = await getSession();
  if (!session) return;

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('links')
    .update({ snoozed_until: null })
    .eq('user_id', session.user.id)
    .not('snoozed_until', 'is', null)
    .lte('snoozed_until', now);

  if (error) console.error('[ZenLink] Failed to wake snoozed links:', error.message);
  else console.log('[ZenLink] Checked snoozed links.');
}
