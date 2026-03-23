import React from 'react';

interface Link {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  tags: string[];
  snoozed_until?: string;
}

interface LinkCardProps {
  link: Link;
}

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {link.favicon ? (
        <img src={link.favicon} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full bg-gray-200" />
      )}

      <div className="flex flex-col gap-1 min-w-0">
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
      </div>
    </div>
  );
}
