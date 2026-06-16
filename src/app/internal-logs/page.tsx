"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Lock, 
  Unlock, 
  Search, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Database, 
  AlertTriangle, 
  Info, 
  Terminal, 
  ArrowDown, 
  X,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";

// Định nghĩa cấu trúc Log
interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
  meta?: Record<string, any>;
}

export default function InternalLogsPage() {
  // State bảo mật
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // State quản lý Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // State tìm kiếm & bộ lọc
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  
  // State điều khiển terminal
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000); // 3 giây
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Kiểm tra session cũ từ client
  useEffect(() => {
    const savedCode = sessionStorage.getItem("internal_logs_code");
    if (savedCode) {
      setPasscode(savedCode);
      verifyAccess(savedCode, true);
    }
  }, []);

  // Hàm xác thực mật khẩu với API
  async function verifyAccess(codeToVerify: string, isAuto: boolean = false) {
    if (!codeToVerify) return;
    setIsAuthenticating(true);
    setAuthError("");

    try {
      const res = await fetch("/api/logs", {
        method: "GET",
        headers: {
          "x-access-code": codeToVerify
        }
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setIsMock(data.isMock || false);
        setIsAuthenticated(true);
        setLastUpdated(new Date());
        sessionStorage.setItem("internal_logs_code", codeToVerify);
      } else {
        const errData = await res.json().catch(() => ({}));
        setAuthError(errData.error || "Mã xác thực không đúng!");
        if (!isAuto) {
          triggerShake();
        }
        if (isAuto) {
          sessionStorage.removeItem("internal_logs_code");
        }
      }
    } catch (err: any) {
      setAuthError(`Lỗi kết nối API: ${err.message}`);
      if (!isAuto) triggerShake();
    } finally {
      setIsAuthenticating(false);
    }
  }

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAccess(passcode);
  };

  // Hàm load logs thủ công hoặc định kỳ
  const fetchLogs = async () => {
    const savedCode = sessionStorage.getItem("internal_logs_code") || passcode;
    if (!savedCode) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/logs", {
        method: "GET",
        headers: {
          "x-access-code": savedCode
        }
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setIsMock(data.isMock || false);
        setLastUpdated(new Date());
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Có lỗi xảy ra khi tải logs.");
      }
    } catch (err: any) {
      setError(`Không thể kết nối API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Tự động cuộn xuống cuối terminal
  const scrollToBottom = () => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cuộn khi logs thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [logs, autoScroll]);

  // Lắng nghe hành vi cuộn của người dùng để tạm ngưng/bật lại tự động cuộn (Follow Logs)
  const handleScroll = () => {
    const container = terminalBodyRef.current;
    if (!container) return;

    // Xem người dùng có đang ở sát đáy (trong khoảng sai số 40px) không
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 40;

    // Nếu cuộn lên trên (không ở sát đáy) và đang bật autoScroll -> Tắt autoScroll để xem log yên tĩnh
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
    // Nếu kéo sát lại xuống đáy -> Tự động bật lại autoScroll
    else if (isAtBottom && !autoScroll) {
      setAutoScroll(true);
    }
  };

  // Thiết lập tự động tải lại (polling)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, refreshInterval, passcode]);

  // Lọc logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Lọc theo level
      if (selectedLevel !== "all" && log.level !== selectedLevel) return false;
      
      // Lọc theo service
      if (selectedService !== "all" && log.service !== selectedService) return false;

      // Tìm kiếm text
      if (searchTerm.trim() !== "") {
        const search = searchTerm.toLowerCase();
        return (
          log.message.toLowerCase().includes(search) ||
          log.service.toLowerCase().includes(search) ||
          log.level.toLowerCase().includes(search) ||
          JSON.stringify(log.meta || {}).toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [logs, selectedLevel, selectedService, searchTerm]);

  // Lấy danh sách các services duy nhất để hiển thị bộ lọc
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    logs.forEach(log => services.add(log.service));
    return Array.from(services);
  }, [logs]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    let total = logs.length;
    let errors = logs.filter(l => l.level === "error").length;
    let warnings = logs.filter(l => l.level === "warn").length;
    let debugs = logs.filter(l => l.level === "debug").length;
    let infos = logs.filter(l => l.level === "info").length;

    return { total, errors, warnings, debugs, infos };
  }, [logs]);

  // Copy tệp log đơn
  const handleCopyLog = (log: LogEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[${new Date(log.timestamp).toLocaleString("vi-VN")}] [${log.service.toUpperCase()}] [${log.level.toUpperCase()}] - ${log.message} ${log.meta ? "\nMeta: " + JSON.stringify(log.meta, null, 2) : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 200);
  };

  // Export toàn bộ log ra file text
  const handleExportAll = () => {
    const header = `=== BONDY LIVE SYSTEM LOGS EXPORT ===\nExported At: ${new Date().toLocaleString("vi-VN")}\nTotal logs: ${filteredLogs.length}\n\n`;
    const body = filteredLogs.map(log => 
      `[${new Date(log.timestamp).toLocaleString("vi-VN")}] [${log.service.toUpperCase()}] [${log.level.toUpperCase()}] - ${log.message} ${log.meta ? "\nMeta: " + JSON.stringify(log.meta) : ""}`
    ).join("\n----------------------------------------\n");

    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bondy_logs_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Xóa danh sách log hiển thị hiện tại
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Hàm logout
  const handleLogout = () => {
    sessionStorage.removeItem("internal_logs_code");
    setIsAuthenticated(false);
    setPasscode("");
  };

  // Định dạng hiển thị thời gian
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("vi-VN", { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
    } catch {
      return "00:00:00.000";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  // Định dạng hiển thị meta cùng 1 dòng
  const formatInlineMeta = (meta: Record<string, any> | undefined) => {
    if (!meta || meta.raw) return "";

    // Sao chép tránh làm ảnh hưởng đến dữ liệu gốc
    const inlineData = { ...meta };

    // Rút gọn các lỗi dài ngoằng hoặc stack trace để hiển thị dòng log gọn gàng
    if (inlineData.err && typeof inlineData.err === "object") {
      inlineData.err = inlineData.err.message || inlineData.err.name || "Error";
    }
    if (inlineData.stack) {
      delete inlineData.stack;
    }

    return JSON.stringify(inlineData);
  };

  // Lấy màu sắc cho badge của từng level
  const getLevelStyle = (level: string) => {
    switch (level) {
      case "error":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold";
      case "warn":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold";
      case "debug":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "info":
      default:
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
  };

  // Màn hình khóa chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
        {/* Glow Background Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Lock Screen Container */}
        <div 
          className={`w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 transition-transform duration-300 ${
            shake ? "animate-bounce" : ""
          }`}
          style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}
        >
          {/* Style shake animation */}
          <style jsx global>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-8px); }
              40%, 80% { transform: translateX(8px); }
            }
          `}</style>

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 mb-4 ring-4 ring-brand-primary/15">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">BONDY ADMIN PORTAL</h1>
            <p className="text-slate-400 text-sm mt-1 text-center font-medium">Khu vực dành riêng cho nhà phát triển & vận hành</p>
          </div>

          {/* Form nhập Passcode */}
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="passcode" className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Nhập Mã Bảo Mật Nội Bộ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  id="passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••••"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all text-center tracking-widest text-lg font-bold"
                  disabled={isAuthenticating}
                  autoFocus
                />
              </div>
              
              {authError && (
                <div className="mt-3 flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating || !passcode}
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang xác minh bảo mật...
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  Mở khóa Console
                </>
              )}
            </button>
          </form>

          {/* Hướng dẫn cài đặt trên môi trường Local */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <span className="inline-block px-3 py-1 bg-slate-950/50 rounded-full border border-slate-800 text-[10px] text-slate-500 font-mono">
              Dev Mode Passcode: admin
            </span>
          </div>
        </div>
      </main>
    );
  }

  // Bảng điều khiển Console Logs (Màn hình chính khi đã đăng nhập)
  return (
    <main className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans select-text">
      
      {/* HEADER BAR */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 py-3 px-6 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-md">
            <Terminal className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-bold text-white text-base tracking-wider font-mono">BONDY LIVE TERMINAL</h1>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {isMock && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold uppercase animate-pulse">
                  <Database className="w-3 h-3" /> DEMO MODE
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString("vi-VN") : "--:--:--"} | 
              <span className="text-brand-primary ml-1 cursor-pointer hover:underline" onClick={handleLogout}>Đăng xuất</span>
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-mono">Auto Poll:</span>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-1 rounded-lg cursor-pointer ${autoRefresh ? "text-emerald-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-800"}`}
              title={autoRefresh ? "Pause Polling" : "Start Polling"}
            >
              {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="bg-transparent border-0 text-white font-mono focus:ring-0 cursor-pointer pr-1"
            >
              <option value={2000} className="bg-slate-900">2s</option>
              <option value={3000} className="bg-slate-900">3s</option>
              <option value={5000} className="bg-slate-900">5s</option>
              <option value={10000} className="bg-slate-900">10s</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Tải lại ngay"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-primary" : ""}`} />
            </button>
            
            <button
              onClick={handleExportAll}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Xuất toàn bộ log ra tệp .txt"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-rose-400 hover:text-rose-300 transition cursor-pointer text-xs font-semibold"
              title="Xóa log hiển thị"
            >
              Clear
            </button>
          </div>
        </div>

      </header>

      {/* ERROR ANNOUNCEMENT IF ANY */}
      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-3 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <span className="font-mono flex-1"><strong>Lỗi:</strong> {error}</span>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* QUICK STATS PANEL */}
      <section className="bg-slate-950/30 grid grid-cols-2 md:grid-cols-5 border-b border-slate-900/60 p-4 gap-3">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col">
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">Tổng số Logs</span>
          <span className="text-2xl font-bold text-slate-200 mt-1 font-mono">{stats.total}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col">
          <span className="text-rose-400/80 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Errors
          </span>
          <span className="text-2xl font-bold text-rose-400 mt-1 font-mono">{stats.errors}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col">
          <span className="text-amber-400/80 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warnings
          </span>
          <span className="text-2xl font-bold text-amber-400 mt-1 font-mono">{stats.warnings}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col">
          <span className="text-emerald-400/80 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" /> Infos
          </span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{stats.infos}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col col-span-2 md:col-span-1">
          <span className="text-purple-400/80 text-[10px] font-mono uppercase tracking-wider">Debug Logs</span>
          <span className="text-2xl font-bold text-purple-400 mt-1 font-mono">{stats.debugs}</span>
        </div>
      </section>

      {/* FILTER & TOOLBAR */}
      <section className="bg-slate-950/20 border-b border-slate-900 p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm nội dung logs, service, JSON..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")} 
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Level Filters tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono mr-1">Level:</span>
          {["all", "info", "warn", "error", "debug"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg border font-mono uppercase cursor-pointer transition ${
                selectedLevel === lvl
                  ? lvl === "error" ? "bg-rose-500/20 text-rose-400 border-rose-500/50" 
                    : lvl === "warn" ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                    : lvl === "debug" ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                    : lvl === "info" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                    : "bg-slate-200 text-slate-950 border-slate-300 font-semibold"
                  : "bg-slate-900/30 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Service filter & Auto scroll */}
        <div className="flex items-center justify-between lg:justify-end gap-6 text-xs">
          
          {/* Service filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 cursor-pointer focus:outline-none focus:border-brand-primary"
            >
              <option value="all">All Services</option>
              {uniqueServices.map(srv => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* Auto Scroll Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-brand-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-slate-400 font-mono">Follow Logs</span>
          </label>

        </div>

      </section>

      {/* TERMINAL BODY */}
      <section 
        className="flex-1 bg-[#090b0e] overflow-y-auto px-6 py-4 font-mono text-sm leading-relaxed border-b border-slate-900"
        style={{ minHeight: "calc(100vh - 280px)" }}
        ref={terminalBodyRef}
        onScroll={handleScroll}
      >
        <div className="max-w-full space-y-1.5">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
              <Terminal className="w-12 h-12 text-slate-600 animate-pulse" />
              <p className="text-center font-medium">Không tìm thấy dòng log nào khớp bộ lọc!</p>
              <p className="text-xs text-slate-600">Đợi log mới cập nhật hoặc thử thay đổi điều kiện lọc.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              
              return (
                <div 
                  key={log.id} 
                  className={`group rounded-lg transition-colors duration-150 ${
                    isExpanded 
                      ? "bg-slate-900/60 border border-slate-800 px-4 py-3" 
                      : "hover:bg-slate-900/30 py-1 px-2 border border-transparent"
                  }`}
                >
                  
                  {/* Dòng Log Header (Luôn hiển thị) */}
                  <div 
                    className="flex flex-col lg:flex-row lg:items-start gap-2 lg:gap-3 cursor-pointer"
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  >
                    
                    {/* Timestamp & Time/Date */}
                    <span className="text-slate-500 text-[11px] select-none whitespace-nowrap pt-0.5">
                      <span className="hidden md:inline mr-1 text-slate-600">{formatDate(log.timestamp)}</span>
                      {formatTime(log.timestamp)}
                    </span>

                    {/* Service Name */}
                    <span className="text-purple-400 text-xs font-semibold whitespace-nowrap min-w-[110px] select-none pt-0.5">
                      [{log.service}]
                    </span>

                    {/* Level Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider select-none font-mono whitespace-nowrap ${getLevelStyle(log.level)}`}>
                      {log.level}
                    </span>

                    {/* Log Message */}
                    <span className={`flex-1 break-all text-xs lg:text-sm font-medium ${
                      log.level === "error" ? "text-rose-200" 
                        : log.level === "warn" ? "text-amber-200"
                        : log.level === "debug" ? "text-purple-300/80"
                        : "text-slate-300"
                    }`}>
                      {log.message}
                      {log.meta && !log.meta.raw && (
                        <span className="text-slate-500 font-mono ml-2 text-[11px] lg:text-xs font-normal">
                          {formatInlineMeta(log.meta)}
                        </span>
                      )}
                    </span>

                    {/* Action tools on hover */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-2 select-none">
                      <button
                        onClick={(e) => handleCopyLog(log, e)}
                        className="p-1 text-slate-500 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-md cursor-pointer transition"
                        title="Sao chép dòng log"
                      >
                        {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-[10px] text-slate-600 hidden md:inline">
                        {isExpanded ? "Collapse" : "Expand"}
                      </span>
                    </div>

                  </div>

                  {/* Expanded Meta Details JSON (Hiển thị khi click) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 ml-0 lg:ml-20 overflow-x-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-brand-primary" /> Meta Details & Context
                        </span>
                        
                        <button
                          onClick={(e) => handleCopyLog(log, e)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded cursor-pointer transition"
                        >
                          {copiedId === log.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      {log.meta ? (
                        <pre className="text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
                          <code>{JSON.stringify(log.meta, null, 2)}</code>
                        </pre>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Không có siêu dữ liệu (meta) đính kèm dòng log này.</p>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </section>

      {/* FOOTER STATS BAR */}
      <footer className="bg-slate-950 px-6 py-2.5 text-xs text-slate-500 font-mono flex flex-col md:flex-row justify-between items-center gap-2 border-t border-slate-900">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Next.js API Secure Proxy Active</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Displayed Logs: {filteredLogs.length} / {logs.length}</span>
          <span className="hidden md:inline">|</span>
          <span className="text-[10px] text-slate-600">Bondy v1.2.0 • Security Enforced</span>
        </div>
      </footer>

    </main>
  );
}
