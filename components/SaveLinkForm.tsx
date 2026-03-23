import React, { useState, useEffect } from 'react';
import TagInput from './TagInput';

export default function SaveLinkForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Pre-fill with current tab info
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
      const res = await fetch('http://localhost:54321/functions/v1/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pageTitle }),
      });
      const data = await res.json() as { tags: string[] };
      setTags(data.tags ?? []);
    } catch {
      // Graceful degradation — AI is optional
    } finally {
      setLoadingTags(false);
    }
  }

  function handleSave() {
    if (!url) return;
    // TODO: save to Supabase
    console.log('Saving:', { url, title, tags });
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
      <TagInput
        tags={tags}
        onChange={setTags}
        loading={loadingTags}
      />
      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 rounded-md transition-colors"
      >
        Save Link
      </button>
    </div>
  );
}
