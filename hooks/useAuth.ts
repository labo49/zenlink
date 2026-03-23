import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

function isFirefox() {
  return browser.runtime.getURL('').startsWith('moz-extension://');
}

async function extractTokensFromUrl(url: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const parsed = new URL(url);
  const hashParams = new URLSearchParams(parsed.hash.slice(1));
  const queryParams = new URLSearchParams(parsed.search);
  const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');
  if (accessToken && refreshToken) return { accessToken, refreshToken };
  return null;
}

// Chrome: use browser.identity.launchWebAuthFlow
async function signInChrome(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const redirectUrl = browser.identity.getRedirectURL();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
  });

  if (error || !data.url) return null;

  const responseUrl = await browser.identity.launchWebAuthFlow({
    url: data.url,
    interactive: true,
  });

  if (!responseUrl) return null;
  return extractTokensFromUrl(responseUrl);
}

// Firefox: delegate to background script which holds the webRequest listener
async function signInFirefox(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { skipBrowserRedirect: true },
  });

  if (error || !data.url) return null;

  const result = await browser.runtime.sendMessage({
    type: 'FIREFOX_SIGN_IN',
    oauthUrl: data.url,
  });

  return result ?? null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const result = isFirefox() ? await signInFirefox() : await signInChrome();

    if (result) {
      await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, loading, signInWithGoogle, signOut };
}
