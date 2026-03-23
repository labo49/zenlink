import React from 'react';
import LinkCard from './LinkCard';

// Placeholder until Supabase is wired up
const MOCK_LINKS = [
  {
    id: '1',
    url: 'https://example.com/article',
    title: 'An interesting article',
    tags: ['reading', 'tech'],
  },
];

export default function InboxView() {
  if (MOCK_LINKS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
        Your inbox is empty.
      </div>
    );
  }

  return (
    <div>
      {MOCK_LINKS.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
