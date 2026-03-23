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

    function interceptor(details: { url: string }) {
      if (!details.url.includes('access_token=')) return {};

      browser.webRequest.onBeforeRequest.removeListener(interceptor);
      if (tabId !== undefined) browser.tabs.remove(tabId);

      const url = new URL(details.url);
      const hashParams = new URLSearchParams(url.hash.slice(1));
      const queryParams = new URLSearchParams(url.search);

      const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');

      resolve(accessToken && refreshToken ? { accessToken, refreshToken } : null);
      return { cancel: true };
    }

    browser.webRequest.onBeforeRequest.addListener(
      interceptor,
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
