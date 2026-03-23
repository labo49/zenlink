import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSnoozedLinks, useDeleteLink } from '@/hooks/useLinks';
import LinkCard from './LinkCard';

export default function SnoozedView() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const { data: links = [], isLoading } = useSnoozedLinks(userId);
  const deleteLink = useDeleteLink(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        No snoozed links.
      </div>
    );
  }

  return (
    <div>
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onDelete={() => deleteLink.mutate(link.id)}
        />
      ))}
    </div>
  );
}
