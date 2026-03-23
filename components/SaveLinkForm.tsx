import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSaveLink } from '@/hooks/useLinks';
import { snoozeDate } from '@/hooks/useLinks';
import TagInput from './TagInput';
import SnoozeDropdown from './SnoozeDropdown';
import type { SnoozeSelection } from '@/lib/types';

export default function SaveLinkForm() {
  const { session } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [snoozeSelection, setSnoozeSelection] = useState<SnoozeSelection | null>(null);
  const [showSnooze, setShowSnooze] = useState(false);
  const saveLink = useSaveLink();

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab.url) setUrl(tab.url);
      if (tab.title) {
        setTitle(tab.title);
        fetchAiTags(tab.title);
      }
    });
  }, []);

  async function fetchAiTags(pageTitle: string) {
    setLoadingTags(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ title: pageTitle }),
        },
      );
      const data = await res.json() as { tags: string[] };
      setTags(data.tags ?? []);
    } catch {
      // Graceful degradation — AI is optional
    } finally {
      setLoadingTags(false);
    }
  }

  async function handleSave() {
    if (!url || !session) return;

    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
    const { snoozed_until, on_next_session } = snoozeSelection
      ? snoozeDate(snoozeSelection)
      : { snoozed_until: null, on_next_session: false };

    await saveLink.mutateAsync({
      user_id: session.user.id,
      url,
      title: title || url,
      favicon,
      tags,
      snoozed_until,
      on_next_session,
    });

    setTags([]);
    setSnoozeSelection(null);
  }

  function snoozeLabel(s: SnoozeSelection): string {
    if (s.option === 'friday') return 'Friday 9AM';
    if (s.option === 'monday') return 'Monday 9AM';
    if (s.option === '4weeks') return 'In 4 weeks';
    if (s.option === 'next_session') return 'Next session';
    if (s.option === 'custom' && s.customDate)
      return new Date(s.customDate).toLocaleString();
    return 'Snoozed';
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page title"
        className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-400"
      />
      <TagInput tags={tags} onChange={setTags} loading={loadingTags} />

      {/* Snooze pill / selector */}
      <div className="relative">
        {snoozeSelection ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded-full">
              🕐 {snoozeLabel(snoozeSelection)}
            </span>
            <button
              onClick={() => setSnoozeSelection(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSnooze((v) => !v)}
            className="text-xs text-gray-400 hover:text-amber-500 transition-colors"
          >
            🕐 Snooze on save
          </button>
        )}

        {showSnooze && (
          <SnoozeDropdown
            onSelect={(s) => { setSnoozeSelection(s); setShowSnooze(false); }}
            onClose={() => setShowSnooze(false)}
          />
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saveLink.isPending || !url}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-1.5 rounded-md transition-colors"
      >
        {saveLink.isPending ? 'Saving…' : snoozeSelection ? 'Save & Snooze' : 'Save Link'}
      </button>
    </div>
  );
}
