import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    // Firefox uses extensions.allizom.org, Chrome uses chromiumapp.org
    // browser.identity.getRedirectURL() returns the correct one automatically
    const redirectUrl = browser.identity.getRedirectURL();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) return;

    const responseUrl = await browser.identity.launchWebAuthFlow({
      url: data.url,
      interactive: true,
    });

    if (!responseUrl) return;

    // Tokens may be in the hash (implicit flow) or query params (PKCE)
    const url = new URL(responseUrl);
    const hashParams = new URLSearchParams(url.hash.slice(1));
    const queryParams = new URLSearchParams(url.search);

    const accessToken = hashParams.get('access_token') ?? queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') ?? queryParams.get('refresh_token');

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { session, loading, signInWithGoogle, signOut };
}
