'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LogsViewer from './LogsViewer';

function LogsPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;

  return <LogsViewer initialToken={token} />;
}

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white bg-gray-900 h-screen font-mono">Loading logs viewer...</div>}>
      <LogsPageContent />
    </Suspense>
  );
}
