import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  loading?: boolean;
}

export default function TagInput({ tags, onChange, loading }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 min-h-[32px] border border-gray-200 rounded-md px-2 py-1.5">
      {loading && (
        <span className="text-xs text-gray-400 italic self-center">Suggesting tags…</span>
      )}
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full"
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-indigo-900 leading-none"
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      {!loading && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? 'Add tags…' : ''}
          className="flex-1 min-w-[80px] text-xs outline-none bg-transparent"
        />
      )}
    </div>
  );
}
