import React, { useState } from 'react';
import type { Link, SnoozeOption } from '@/lib/types';

interface LinkCardProps {
  link: Link;
  onDelete: () => void;
  onSnooze?: (option: SnoozeOption) => void;
}

const SNOOZE_OPTIONS: { label: string; value: SnoozeOption }[] = [
  { label: 'Friday morning', value: 'friday' },
  { label: 'Monday morning', value: 'monday' },
  { label: 'In 4 weeks', value: '4weeks' },
  { label: 'Next session', value: 'next_session' },
];

export default function LinkCard({ link, onDelete, onSnooze }: LinkCardProps) {
  const [showSnooze, setShowSnooze] = useState(false);

  return (
    <div className="relative flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group">
      {link.favicon ? (
        <img src={link.favicon} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full bg-gray-200" />
      )}

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-800 hover:text-indigo-600 truncate"
        >
          {link.title || link.url}
        </a>

        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.tags.map((tag) => (
              <span
                key={tag}
                className="bg-indigo-50 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {link.snoozed_until && (
          <span className="text-xs text-amber-500">
            Snoozed until {new Date(link.snoozed_until).toLocaleDateString()}
          </span>
        )}

        {link.on_next_session && (
          <span className="text-xs text-amber-500">Snoozed until next session</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onSnooze && (
          <div className="relative">
            <button
              onClick={() => setShowSnooze((v) => !v)}
              className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
              title="Snooze"
            >
              🕐
            </button>
            {showSnooze && (
              <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                {SNOOZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSnooze(opt.value); setShowSnooze(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          ×
        </button>
      </div>
    </div>
  );
}
