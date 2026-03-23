import { supabase } from '@/lib/supabase';
import type { Link } from '@/lib/types';

export default defineBackground(() => {
  // Firefox OAuth flow — initiated by popup via message
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'FIREFOX_SIGN_IN') {
      handleFirefoxSignIn(message.oauthUrl).then(sendResponse);
      return true; // Keep message channel open for async response
    }
  });

  // On browser startup, move on_next_session links back to inbox and open them
  browser.runtime.onStartup.addListener(handleNextSessionLinks);
  browser.runtime.onInstalled.addListener(handleNextSessionLinks);

  // Check snoozed links every 5 minutes
  browser.alarms.create('snooze-check', { periodInMinutes: 5 });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'snooze-check') handleSnoozedLinks();
  });
});

async function handleFirefoxSignIn(oauthUrl: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  return new Promise((resolve) => {
    let tabId: number | undefined;
    let done = false;

    function cleanup() {
      browser.tabs.onUpdated.removeListener(onTabUpdated);
      browser.webRequest.onBeforeRequest.removeListener(cancelLocalhost);
    }

    // tabs.onUpdated sees the FULL URL including the hash fragment
    // This fires when the tab navigates to localhost:3000/#access_token=...
    function onTabUpdated(id: number, _changeInfo: object, tab: { url?: string }) {
      if (id !== tabId || done) return;
      const url = tab.url ?? '';
      if (!url.includes('access_token=')) return;

      done = true;
      cleanup();
      browser.tabs.remove(tabId!);

      const parsed = new URL(url);
      const hash = new URLSearchParams(parsed.hash.slice(1));
      const query = new URLSearchParams(parsed.search);
      const accessToken = hash.get('access_token') ?? query.get('access_token');
      const refreshToken = hash.get('refresh_token') ?? query.get('refresh_token');
      resolve(accessToken && refreshToken ? { accessToken, refreshToken } : null);
    }

    // webRequest cancels the actual connection so Firefox never shows "Unable to connect"
    function cancelLocalhost(details: { tabId: number }) {
      if (details.tabId !== tabId) return {};
      return { cancel: true };
    }

    browser.tabs.onUpdated.addListener(onTabUpdated);
    browser.webRequest.onBeforeRequest.addListener(
      cancelLocalhost,
      { urls: ['http://localhost:3000/*'] },
      ['blocking'],
    );

    browser.tabs.create({ url: oauthUrl, active: true }).then((tab) => {
      tabId = tab.id;
    });
  });
}

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
