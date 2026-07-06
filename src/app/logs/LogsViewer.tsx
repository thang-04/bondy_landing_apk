'use client';

import { useState, useEffect, useRef } from 'react';

export default function LogsViewer({ initialToken }: { initialToken?: string }) {
  const [token, setToken] = useState(initialToken || '');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = () => {
    if (!token) return;
    setIsConnecting(true);
    setLogs([]); // Clear logs on new connection

    const eventSource = new EventSource(`/api/logs?token=${encodeURIComponent(token)}`);
    
    eventSource.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setLogs((prev) => [...prev, '[Connected to Docker Logs Stream]']);
    };

    eventSource.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, '[Error: Connection lost or unauthorized]']);
      eventSource.close();
      setIsConnected(false);
      setIsConnecting(false);
    };

    eventSourceRef.current = eventSource;
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setLogs((prev) => [...prev, '[Disconnected]']);
  };

  useEffect(() => {
    if (initialToken && !isConnected && !isConnecting) {
      connect();
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 p-4 font-mono text-sm">
      <div className="flex items-center gap-4 mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
        <h1 className="text-xl font-bold text-green-400">Docker Logs Viewer</h1>
        <div className="flex-1"></div>
        {!isConnected ? (
          <>
            <input
              type="password"
              placeholder="Enter API Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:border-green-400 text-gray-200"
            />
            <button
              onClick={connect}
              disabled={!token || isConnecting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </>
        ) : (
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="flex-1 bg-black border border-gray-700 rounded-lg p-4 overflow-y-auto font-mono text-sm leading-relaxed shadow-inner">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Waiting for connection...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap break-words text-gray-300">
              {log}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
