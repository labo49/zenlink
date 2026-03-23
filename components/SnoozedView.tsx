import React from 'react';
import LinkCard from './LinkCard';

// Placeholder until Supabase is wired up
const MOCK_SNOOZED: {
  id: string;
  url: string;
  title: string;
  tags: string[];
  snoozed_until: string;
}[] = [];

export default function SnoozedView() {
  if (MOCK_SNOOZED.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
        No snoozed links.
      </div>
    );
  }

  return (
    <div>
      {MOCK_SNOOZED.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
