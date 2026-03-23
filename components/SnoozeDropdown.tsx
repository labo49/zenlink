import React, { useState, useRef, useEffect } from 'react';
import type { SnoozeSelection } from '@/lib/types';

interface SnoozeDropdownProps {
  onSelect: (selection: SnoozeSelection) => void;
  onClose: () => void;
}

const QUICK_OPTIONS = [
  { label: 'Friday morning', value: 'friday' },
  { label: 'Monday morning', value: 'monday' },
  { label: 'In 4 weeks', value: '4weeks' },
  { label: 'Next session', value: 'next_session' },
] as const;

// Minimum datetime string for the input (now)
function minDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function SnoozeDropdown({ onSelect, onClose }: SnoozeDropdownProps) {
  const [customDate, setCustomDate] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  function handleCustomSubmit() {
    if (!customDate) return;
    onSelect({ option: 'custom', customDate: new Date(customDate).toISOString() });
    onClose();
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-52"
    >
      {QUICK_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { onSelect({ option: opt.value }); onClose(); }}
          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          {opt.label}
        </button>
      ))}

      <div className="border-t border-gray-100 mt-1 pt-1 px-3 pb-2">
        <p className="text-xs text-gray-400 mb-1">Custom date & time</p>
        <input
          type="datetime-local"
          value={customDate}
          min={minDatetime()}
          onChange={(e) => setCustomDate(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400 mb-1.5"
        />
        <button
          onClick={handleCustomSubmit}
          disabled={!customDate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium py-1 rounded transition-colors"
        >
          Set
        </button>
      </div>
    </div>
  );
}
