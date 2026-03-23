import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import InboxView from '@/components/InboxView';
import SnoozedView from '@/components/SnoozedView';
import SaveLinkForm from '@/components/SaveLinkForm';

type Tab = 'inbox' | 'snoozed';

export default function App() {
  const { session, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('inbox');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <span className="font-bold text-lg text-indigo-600">ZenLink</span>
        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Save link form */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <SaveLinkForm />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {(['inbox', 'snoozed'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* View */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'inbox' ? <InboxView /> : <SnoozedView />}
      </div>
    </div>
  );
}
