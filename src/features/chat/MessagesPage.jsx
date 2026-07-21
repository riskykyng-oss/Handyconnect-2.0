import React from 'react';
import Card from '@/components/ui/Card';

export default function MessagesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
      <Card>
        <p className="text-gray-500 text-center py-8">
          Your active conversations will appear here in a list soon! For now, you can chat directly from your Job Cards.
        </p>
      </Card>
    </div>
  );
}