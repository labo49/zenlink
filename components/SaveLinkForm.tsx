import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSaveLink } from '@/hooks/useLinks';
import TagInput from './TagInput';

export default function SaveLinkForm() {
  const { session } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
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

    await saveLink.mutateAsync({
      user_id: session.user.id,
      url,
      title: title || url,
      favicon,
      tags,
      snoozed_until: null,
      on_next_session: false,
    });

    setTags([]);
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
      <button
        onClick={handleSave}
        disabled={saveLink.isPending || !url}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-1.5 rounded-md transition-colors"
      >
        {saveLink.isPending ? 'Saving…' : 'Save Link'}
      </button>
    </div>
  );
}
