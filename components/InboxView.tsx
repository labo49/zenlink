import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInboxLinks, useDeleteLink, useSnoozeLink, useSearchLinks } from '@/hooks/useLinks';
import LinkCard from './LinkCard';
import type { SnoozeOption } from '@/lib/types';

export default function InboxView() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const [query, setQuery] = useState('');

  const inbox = useInboxLinks(userId);
  const search = useSearchLinks(userId, query);
  const deleteLink = useDeleteLink(userId);
  const snoozeLink = useSnoozeLink(userId);

  const links = query.trim().length > 1 ? (search.data ?? []) : (inbox.data ?? []);
  const isLoading = query.trim().length > 1 ? search.isLoading : inbox.isLoading;

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2 border-b border-gray-100">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search links…"
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-400"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          Loading…
        </div>
      )}

      {!isLoading && links.length === 0 && (
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          {query ? 'No results.' : 'Your inbox is empty.'}
        </div>
      )}

      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onDelete={() => deleteLink.mutate(link.id)}
          onSnooze={(option: SnoozeOption) => snoozeLink.mutate({ id: link.id, option })}
        />
      ))}
    </div>
  );
}
