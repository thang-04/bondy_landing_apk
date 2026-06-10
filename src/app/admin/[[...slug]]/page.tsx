"use client";

import dynamic from "next/dynamic";

// Dynamically import the main App component of the admin app with SSR disabled.
const AdminApp = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-sm text-zinc-500 animate-pulse font-medium">Đang tải Admin Dashboard...</p>
      </div>
    </div>
  ),
});

export default function AdminCatchAllPage() {
  return (
    <div className="admin-theme-scope w-full h-full min-h-screen">
      <AdminApp />
    </div>
  );
}
