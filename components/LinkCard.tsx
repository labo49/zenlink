import React, { useState } from 'react';
import type { Link, SnoozeSelection } from '@/lib/types';
import SnoozeDropdown from './SnoozeDropdown';

interface LinkCardProps {
  link: Link;
  onDelete: () => void;
  onSnooze?: (selection: SnoozeSelection) => void;
}

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
            Snoozed until {new Date(link.snoozed_until).toLocaleString()}
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
              <SnoozeDropdown
                onSelect={onSnooze}
                onClose={() => setShowSnooze(false)}
              />
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
