import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users,
  ClipboardList,
  BookOpen,
  Headphones,
  Activity,
  Route,
  FileBarChart,
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  PlusCircle,
  ChevronRight,
  Download,
  LayoutDashboard,
  Heart,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { api, unwrap } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Sinh dữ liệu phân tích giả lập dựa trên khoảng thời gian chọn lựa
function getMockAnalyticsData(range) {
  const timelineData = {
    today: [
      { label: '02h', success: 12, failed: 4 },
      { label: '04h', success: 8, failed: 2 },
      { label: '06h', success: 15, failed: 5 },
      { label: '08h', success: 38, failed: 12 },
      { label: '10h', success: 64, failed: 18 },
      { label: '12h', success: 52, failed: 15 },
      { label: '14h', success: 48, failed: 14 },
      { label: '16h', success: 58, failed: 16 },
      { label: '18h', success: 72, failed: 22 },
      { label: '20h', success: 85, failed: 25 },
      { label: '22h', success: 42, failed: 10 },
      { label: '24h', success: 20, failed: 6 }
    ],
    '7d': [
      { label: 'Thứ 2', success: 120, failed: 45 },
      { label: 'Thứ 3', success: 145, failed: 38 },
      { label: 'Thứ 4', success: 190, failed: 52 },
      { label: 'Thứ 5', success: 165, failed: 40 },
      { label: 'Thứ 6', success: 215, failed: 58 },
      { label: 'Thứ 7', success: 260, failed: 65 },
      { label: 'Chủ Nhật', success: 295, failed: 70 }
    ],
    '30d': [
      { label: 'Tuần 1', success: 850, failed: 240 },
      { label: 'Tuần 2', success: 980, failed: 290 },
      { label: 'Tuần 3', success: 1100, failed: 310 },
      { label: 'Tuần 4', success: 1250, failed: 350 }
    ],
    all: [
      { label: 'Tháng 1', success: 3200, failed: 950 },
      { label: 'Tháng 2', success: 3800, failed: 1100 },
      { label: 'Tháng 3', success: 4500, failed: 1300 },
      { label: 'Tháng 4', success: 5100, failed: 1450 },
      { label: 'Tháng 5', success: 6200, failed: 1700 },
      { label: 'Tháng 6', success: 7500, failed: 2100 }
    ]
  }

  const summaryData = {
    today: {
      totalMatches: 630,
      successMatches: 506,
      failedMatches: 124,
      successRate: 80.3,
      totalRelationships: 48,
      relationshipPending: 10,
      relationshipConfirmed: 32,
      relationshipDeclined: 6
    },
    '7d': {
      totalMatches: 1718,
      successMatches: 1390,
      failedMatches: 328,
      successRate: 80.9,
      totalRelationships: 320,
      relationshipPending: 45,
      relationshipConfirmed: 245,
      relationshipDeclined: 30
    },
    '30d': {
      totalMatches: 5370,
      successMatches: 4180,
      failedMatches: 1190,
      successRate: 77.8,
      totalRelationships: 1250,
      relationshipPending: 180,
      relationshipConfirmed: 920,
      relationshipDeclined: 150
    },
    all: {
      totalMatches: 37550,
      successMatches: 30300,
      failedMatches: 7250,
      successRate: 80.7,
      totalRelationships: 8450,
      relationshipPending: 850,
      relationshipConfirmed: 6600,
      relationshipDeclined: 1000
    }
  }

  const featureUsageData = {
    today: [
      { feature: 'Góc Tự Thấu Cảm', uses: 450, percentage: 40.2 },
      { feature: 'Góc Đôi Lứa', uses: 360, percentage: 32.1 },
      { feature: 'Hòa giải mâu thuẫn', uses: 170, percentage: 15.2 },
      { feature: 'Trò chuyện AI Coach', uses: 140, percentage: 12.5 }
    ],
    '7d': [
      { feature: 'Góc Tự Thấu Cảm', uses: 3240, percentage: 41.5 },
      { feature: 'Góc Đôi Lứa', uses: 2450, percentage: 31.4 },
      { feature: 'Hòa giải mâu thuẫn', uses: 1180, percentage: 15.1 },
      { feature: 'Trò chuyện AI Coach', uses: 930, percentage: 11.9 }
    ],
    '30d': [
      { feature: 'Góc Tự Thấu Cảm', uses: 13500, percentage: 42.1 },
      { feature: 'Góc Đôi Lứa', uses: 9800, percentage: 30.5 },
      { feature: 'Hòa giải mâu thuẫn', uses: 4800, percentage: 14.9 },
      { feature: 'Trò chuyện AI Coach', uses: 4000, percentage: 12.5 }
    ],
    all: [
      { feature: 'Góc Tự Thấu Cảm', uses: 98500, percentage: 41.8 },
      { feature: 'Góc Đôi Lứa', uses: 73200, percentage: 31.1 },
      { feature: 'Hòa giải mâu thuẫn', uses: 35100, percentage: 14.9 },
      { feature: 'Trò chuyện AI Coach', uses: 28900, percentage: 12.3 }
    ]
  }

  const rangeKey = timelineData[range] ? range : '7d'

  return {
    summary: summaryData[rangeKey],
    matchingTimeline: timelineData[rangeKey],
    featureUsage: featureUsageData[rangeKey]
  }
}

// Biểu đồ SVG Ghép đôi (Đường cong và vùng Gradient)
function MatchingChart({ timeline }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  
  if (!timeline || timeline.length === 0) return null
  
  const maxVal = Math.max(10, ...timeline.map(d => Math.max(d.success, d.failed))) * 1.15
  
  const svgWidth = 600
  const svgHeight = 220
  const padding = { top: 20, right: 20, bottom: 40, left: 45 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom
  
  const points = timeline.map((d, i) => {
    const x = padding.left + (timeline.length > 1 ? (i / (timeline.length - 1)) * chartWidth : 0)
    const ySuccess = padding.top + chartHeight - (d.success / maxVal) * chartHeight
    const yFailed = padding.top + chartHeight - (d.failed / maxVal) * chartHeight
    return { x, ySuccess, yFailed, label: d.label, success: d.success, failed: d.failed }
  })
  
  const successPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySuccess}`).join(' ')
  const successArea = `${successPath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
  
  const failedPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yFailed}`).join(' ')
  const failedArea = `${failedPath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
  
  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const val = Math.round((maxVal / 3) * i)
    const y = padding.top + chartHeight - (val / maxVal) * chartHeight
    return { y, val }
  })
  
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" className="overflow-visible select-none">
        <defs>
          <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"/>
          </linearGradient>
          <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {gridLines.map((g, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={g.y}
              x2={svgWidth - padding.right}
              y2={g.y}
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth={1}
              className="text-zinc-200 dark:text-zinc-800"
            />
            <text
              x={padding.left - 10}
              y={g.y + 3}
              textAnchor="end"
              className="text-[9px] font-medium fill-muted-foreground"
            >
              {g.val}
            </text>
          </g>
        ))}
        
        {/* Areas */}
        <path d={successArea} fill="url(#successGradient)" className="transition-all duration-500" />
        <path d={failedArea} fill="url(#failedGradient)" className="transition-all duration-500" />
        
        {/* Lines */}
        <path
          d={successPath}
          fill="none"
          stroke="#10B981"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />
        <path
          d={failedPath}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />
        
        {/* Interactive Dots & Hover regions */}
        {points.map((p, idx) => {
          const isHovered = hoveredIdx === idx
          const triggerWidth = chartWidth / (points.length - 1 || 1)
          const triggerX = p.x - triggerWidth / 2
          
          return (
            <g key={idx}>
              {isHovered && (
                <line
                  x1={p.x}
                  y1={padding.top}
                  x2={p.x}
                  y2={padding.top + chartHeight}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-zinc-300 dark:text-zinc-700"
                />
              )}
              
              {(isHovered || points.length <= 15) && (
                <circle
                  cx={p.x}
                  cy={p.ySuccess}
                  r={isHovered ? 5 : 3.5}
                  fill="#10B981"
                  stroke="white"
                  strokeWidth={isHovered ? 1.5 : 1}
                  className="transition-all duration-200"
                />
              )}
              
              {(isHovered || points.length <= 15) && (
                <circle
                  cx={p.x}
                  cy={p.yFailed}
                  r={isHovered ? 4.5 : 3}
                  fill="#F59E0B"
                  stroke="white"
                  strokeWidth={isHovered ? 1.5 : 1}
                  className="transition-all duration-200"
                />
              )}
              
              <rect
                x={triggerX}
                y={padding.top}
                width={triggerWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              
              {idx % Math.ceil(points.length / 7) === 0 && (
                <text
                  x={p.x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className="text-[9px] font-semibold fill-muted-foreground"
                >
                  {p.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Tooltip Overlay */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute z-20 pointer-events-none rounded-xl border border-muted/80 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-lg backdrop-blur-sm text-xs space-y-1.5 min-w-[140px] transition-all duration-100"
          style={{
            left: `${Math.min(
              85,
              Math.max(15, (points[hoveredIdx].x / svgWidth) * 100)
            )}%`,
            top: '0px',
            transform: 'translate(-50%, -100%)'
          }}
        >
          <p className="font-bold text-foreground border-b border-muted/50 pb-1">{points[hoveredIdx].label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Thành công:
            </span>
            <span className="font-black text-foreground">{points[hoveredIdx].success.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Thất bại:
            </span>
            <span className="font-black text-foreground">{points[hoveredIdx].failed.toLocaleString('vi-VN')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Biểu đồ SVG Tròn (Donut Chart) xác nhận mối quan hệ
function RelationshipDonutChart({ summary }) {
  if (!summary) return null
  
  const relationshipData = [
    { label: 'Đã kết đôi thành công', value: summary.relationshipConfirmed, color: '#10B981' },
    { label: 'Đang chờ xác nhận', value: summary.relationshipPending, color: '#F59E0B' },
    { label: 'Từ chối / Hủy kết đôi', value: summary.relationshipDeclined, color: '#EF4444' }
  ]
  
  const total = relationshipData.reduce((acc, d) => acc + d.value, 0)
  const radius = 40
  const strokeWidth = 8.5
  const circumference = 2 * Math.PI * radius
  const center = 60
  
  let accumulatedPercentage = 0
  const donutSlices = relationshipData.map((d) => {
    const percentage = total > 0 ? (d.value / total) * 100 : 0
    const strokeLength = (percentage / 100) * circumference
    const strokeOffset = circumference - ((accumulatedPercentage / 100) * circumference)
    accumulatedPercentage += percentage
    return { ...d, strokeLength, strokeOffset, percentage }
  })
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      <div className="relative h-32 w-32 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 120 120" className="overflow-visible select-none">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-100 dark:text-zinc-800"
          />
          
          {donutSlices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${slice.strokeLength} ${circumference - slice.strokeLength}`}
              strokeDashoffset={slice.strokeOffset}
              transform={`rotate(-90 ${center} ${center})`}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          ))}
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-foreground leading-none">
            {total.toLocaleString('vi-VN')}
          </span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Yêu cầu
          </span>
        </div>
      </div>
      
      <div className="flex-1 space-y-3 min-w-[160px] w-full">
        {donutSlices.map((d, i) => (
          <div key={i} className="flex items-center justify-between border-b border-muted/50 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs font-semibold text-muted-foreground">{d.label}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-foreground">{d.value.toLocaleString('vi-VN')}</span>
              <span className="text-[10px] font-bold text-muted-foreground ml-1.5">
                ({d.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Biểu đồ thanh ngang (Horizontal Bar Chart) đo tần suất sử dụng tính năng
function FeatureUsageChart({ usage }) {
  if (!usage || usage.length === 0) return null
  
  return (
    <div className="space-y-4 py-1">
      {usage.map((f, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">{f.feature}</span>
            <span className="text-muted-foreground font-semibold">
              {f.uses.toLocaleString('vi-VN')} lượt ({f.percentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative border border-muted/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5A36] via-[#EA2A5A] to-[#8B4AFF] transition-all duration-1000 ease-out"
              style={{ width: `${f.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function fetchStats() {
  return unwrap(api.get('/admin/stats'))
}

function fetchRecentReports() {
  return unwrap(api.get('/admin/reports', { params: { limit: 5 } }))
}

const reportStatusConfig = {
  CREATED: { label: 'Mới tạo', className: 'bg-rose-500/10 text-rose-600 border border-rose-500/20', icon: AlertTriangle },
  UNDER_REVIEW: { label: 'Đang xem xét', className: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', icon: Activity },
  RESOLVED: { label: 'Đã giải quyết', className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', icon: CheckCircle2 },
  REJECTED: { label: 'Đã từ chối', className: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20', icon: XCircle },
}

const reasonConfig = {
  SPAM: 'Spam / Quấy rối hàng loạt',
  HARASSMENT: 'Quấy rối / Lời lẽ thô tục',
  FAKE_PROFILE: 'Hồ sơ giả mạo',
  INAPPROPRIATE: 'Nội dung không phù hợp',
  OTHER: 'Lý do khác',
}

export function DashboardPage() {
  const queryClient = useQueryClient()
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  // Fetch Stats
  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError, error: statsError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  // Fetch detailed analytics (resilient with fallback to mock data)
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['admin', 'analytics', timeRange],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/analytics', { params: { range: timeRange } })
        const body = res.data
        if (body && body.success) return body.data
        return getMockAnalyticsData(timeRange)
      } catch (e) {
        console.warn("API `/admin/analytics` chưa hoạt động. Đang sử dụng Mock Data.", e)
        return getMockAnalyticsData(timeRange)
      }
    },
    refetchInterval: 60_000,
  })

  // Fetch Local APK & Visit Stats
  const { data: localStatsData } = useQuery({
    queryKey: ['admin', 'localStats'],
    queryFn: async () => {
      const res = await fetch('/api-proxy/landing-stats', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch local stats')
      return res.json()
    },
    refetchInterval: 15_000,
  })

  // Fetch Reports
  const { data: reportsData, isLoading: isReportsLoading } = useQuery({
    queryKey: ['admin', 'reports', 'recent'],
    queryFn: fetchRecentReports,
    refetchInterval: 60_000,
  })

  // Mutation for actioning report
  const moderateMutation = useMutation({
    mutationFn: ({ id, action, note = '' }) => {
      return unwrap(api.patch(`/admin/reports/${id}`, { action, note }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Đã cập nhật trạng thái báo cáo thành công!')
      setIsDialogOpen(false)
    },
    onError: (err) => {
      toast.error(err?.message || 'Có lỗi xảy ra khi xử lý báo cáo.')
    },
  })

  if (isStatsLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground animate-pulse">
        Đang tải thông tin tổng quan...
      </div>
    )
  }

  if (isStatsError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive font-medium border border-destructive/20 rounded-xl bg-destructive/5">
        Lỗi tải thống kê: {statsError?.message || 'Không thể kết nối API'}
      </div>
    )
  }

  const s = statsData || {}
  const reports = reportsData?.reports || []

  const kpiCards = [
    {
      label: 'Tổng người dùng',
      value: s.users?.total ?? 0,
      hint: `${s.users?.active ?? 0} đang hoạt động`,
      icon: Users,
      gradient: 'from-[#FF5A36]/8 to-transparent border-t-2 border-t-[#FF5A36]/60',
      iconBg: 'bg-[#FF5A36]/10 text-[#FF5A36]',
    },
    {
      label: 'Bộ khảo sát',
      value: s.surveys?.total ?? 0,
      hint: `${s.surveys?.submissionsTotal ?? 0} lượt nộp`,
      icon: ClipboardList,
      gradient: 'from-[#EA2A5A]/8 to-transparent border-t-2 border-t-[#EA2A5A]/60',
      iconBg: 'bg-[#EA2A5A]/10 text-[#EA2A5A]',
    },
    {
      label: 'Lượt khảo sát hôm nay',
      value: s.surveys?.submissionsToday ?? 0,
      hint: 'tính từ 00:00 hôm nay',
      icon: FileBarChart,
      gradient: 'from-[#8B4AFF]/8 to-transparent border-t-2 border-t-[#8B4AFF]/60',
      iconBg: 'bg-[#8B4AFF]/10 text-[#8B4AFF]',
    },
    {
      label: 'Lượt tải APK',
      value: localStatsData?.downloads ?? 0,
      hint: 'Đếm từ click nút APK',
      icon: Download,
      gradient: 'from-[#10B981]/8 to-transparent border-t-2 border-t-[#10B981]/60',
      iconBg: 'bg-[#10B981]/10 text-[#10B981]',
    },
    {
      label: 'Lượt truy cập Web',
      value: localStatsData?.visits ?? 0,
      hint: 'Tổng lượt load Landing',
      icon: Eye,
      gradient: 'from-[#3B82F6]/8 to-transparent border-t-2 border-t-[#3B82F6]/60',
      iconBg: 'bg-[#3B82F6]/10 text-[#3B82F6]',
    },
  ]

  const healingCards = [
    { label: 'Bài đọc', value: s.healing?.articles ?? 0, icon: BookOpen, color: 'text-[#FF5A36]', border: 'border-l-[#FF5A36]', bg: 'bg-[#FF5A36]/5' },
    { label: 'Audio', value: s.healing?.audios ?? 0, icon: Headphones, color: 'text-[#EA2A5A]', border: 'border-l-[#EA2A5A]', bg: 'bg-[#EA2A5A]/5' },
    { label: 'Bài tập', value: s.healing?.exercises ?? 0, icon: Activity, color: 'text-[#F59E0B]', border: 'border-l-[#F59E0B]', bg: 'bg-[#F59E0B]/5' },
    { label: 'Lộ trình', value: s.healing?.courses ?? 0, icon: Route, color: 'text-[#8B4AFF]', border: 'border-l-[#8B4AFF]', bg: 'bg-[#8B4AFF]/5' },
  ]

  const openReportDetail = (report) => {
    setSelectedReport(report)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF5A36]/8 via-[#EA2A5A]/6 to-[#8B4AFF]/8 p-6 md:p-8 border border-[#FF5A36]/10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Chào mừng trở lại, <span className="bg-gradient-to-r from-[#FF5A36] to-[#8B4AFF] bg-clip-text text-transparent">Admin</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Số liệu thống kê toàn bộ hệ thống chữa lành và báo cáo mới nhất. Hệ thống tự động làm mới sau mỗi 60 giây.
          </p>
        </div>
        
        {/* Floating Decorative Blobs */}
        <div className="absolute right-12 top-0 h-28 w-28 rounded-full bg-[#FF5A36]/10 blur-2xl pointer-events-none" />
        <div className="absolute right-36 bottom-0 h-24 w-24 rounded-full bg-[#8B4AFF]/10 blur-2xl pointer-events-none" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="border-b border-muted/50 pb-1">
          <TabsList className="bg-muted/50 border border-muted/30 p-1 rounded-xl inline-flex gap-1">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-5 py-2 text-xs font-bold text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Tổng quan chung
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg px-5 py-2 text-xs font-bold text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="h-4 w-4" />
              Thống kê chi tiết
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8 mt-0 outline-none">
          {/* KPI Stats */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {kpiCards.map((c) => {
              const Icon = c.icon
              return (
                <Card key={c.label} className={`overflow-hidden border border-muted/70 bg-card text-card-foreground admin-card-hover bg-gradient-to-br ${c.gradient}`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.label}</CardTitle>
                    <div className={`p-2.5 rounded-xl ${c.iconBg} transition-all duration-300`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <div className="text-3xl font-extrabold tracking-tight text-foreground">{c.value.toLocaleString('vi-VN')}</div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {c.hint}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Healing Contents Grid */}
          <div className="space-y-3">
            <h2 className="text-md font-bold text-foreground flex items-center gap-2 tracking-tight">
              <Activity className="h-5 w-5 text-[#FF5A36]" />
              Nội dung Chữa lành
            </h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {healingCards.map((c) => {
                const Icon = c.icon
                return (
                  <Card key={c.label} className={`border-l-4 ${c.border} bg-card admin-card-hover`}>
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{c.label}</p>
                        <p className="text-2xl font-black text-foreground">{c.value.toLocaleString('vi-VN')}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${c.bg}`}>
                        <Icon className={`h-6 w-6 ${c.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Reports and Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Reports Table (Col span 2) */}
            <Card className="lg:col-span-2 border-muted/70 bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-muted/50 pb-4 p-5">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                    Báo cáo mới nhất cần xử lý
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Danh sách báo cáo vi phạm từ cộng đồng người dùng
                  </CardDescription>
                </div>
                {reports.length > 0 && (
                  <Badge className="text-[10px] font-bold border-rose-500/20 text-rose-600 bg-rose-500/10 shadow-none px-2 rounded-full">
                    Cần kiểm duyệt
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {isReportsLoading ? (
                  <div className="p-12 text-center text-sm text-muted-foreground">Đang tải báo cáo...</div>
                ) : reports.length === 0 ? (
                  <div className="p-12 text-center text-sm text-muted-foreground bg-muted/5">
                    Không có báo cáo nào chưa xử lý. Hệ thống an toàn!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Người báo cáo</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Người bị tố cáo</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Lý do</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Trạng thái</TableHead>
                          <TableHead className="w-16 py-3"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((r) => {
                          const statusVal = r.status || 'CREATED'
                          const config = reportStatusConfig[statusVal] || reportStatusConfig.CREATED
                          const StatusIcon = config.icon

                          return (
                            <TableRow key={r.id} className="hover:bg-muted/10 transition-colors">
                              <TableCell className="py-3.5">
                                <div className="text-xs font-bold text-foreground">{r.reporter?.name || '—'}</div>
                                <div className="text-[10px] text-muted-foreground/80 mt-0.5">{r.reporter?.email || '—'}</div>
                              </TableCell>
                              <TableCell className="py-3.5">
                                <div className="text-xs font-bold text-foreground">{r.targetUser?.name || '—'}</div>
                                <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5 mt-0.5">
                                  {r.targetUser?.email || '—'}
                                  {r.targetUser?.isActive === false && (
                                    <Badge className="py-0 px-1.5 text-[8px] bg-rose-100 text-rose-600 border-none font-bold rounded-full">Đã khóa</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-foreground py-3.5 max-w-[140px] truncate">
                                {reasonConfig[r.reason] || r.reason}
                              </TableCell>
                              <TableCell className="py-3.5">
                                <Badge className={`gap-1 py-0.5 px-2 text-[10px] shadow-none rounded-full font-semibold ${config.className}`}>
                                  <StatusIcon className="h-3 w-3 shrink-0" />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3.5 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openReportDetail(r)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground hover:text-[#8B4AFF]" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & Quick Guide (Col span 1) */}
            <div className="space-y-6">
              <Card className="border-muted/70 bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-muted/50 p-5">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PlusCircle className="h-4.5 w-4.5 text-[#FF5A36]" />
                    Thao tác nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2.5 p-5">
                  <Button asChild size="sm" variant="outline" className="justify-start gap-2.5 h-10 rounded-xl hover:bg-muted hover:border-muted transition-all">
                    <Link to="/surveys/new">
                      <PlusCircle className="h-4.5 w-4.5 text-[#FF5A36]" />
                      Tạo khảo sát mới
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="justify-start gap-2.5 h-10 rounded-xl hover:bg-muted hover:border-muted transition-all">
                    <Link to="/healing/articles/new">
                      <BookOpen className="h-4.5 w-4.5 text-[#FF5A36]" />
                      Đăng bài đọc mới
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="justify-start gap-2.5 h-10 rounded-xl hover:bg-muted hover:border-muted transition-all">
                    <Link to="/healing/audios/new">
                      <Headphones className="h-4.5 w-4.5 text-[#EA2A5A]" />
                      Tải lên audio mới
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="justify-start gap-2.5 h-10 rounded-xl hover:bg-muted hover:border-muted transition-all">
                    <Link to="/healing/plans/new">
                      <Route className="h-4.5 w-4.5 text-[#8B4AFF]" />
                      Tạo lộ trình chữa lành
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-muted/70 bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-muted/50 p-5">
                  <CardTitle className="text-sm font-bold">Hướng dẫn kiểm duyệt</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-3.5 text-muted-foreground p-5">
                  <div className="flex gap-3 items-start">
                    <span className="h-5 w-5 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="leading-relaxed">Xem xét chi tiết lý do và mô tả báo cáo từ người dùng báo cáo.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="h-5 w-5 rounded-full bg-[#EA2A5A]/10 text-[#EA2A5A] text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="leading-relaxed">Sử dụng nút <strong>Khóa User</strong> nếu phát hiện tài khoản bị tố cáo có hành vi vi phạm nghiêm trọng.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="h-5 w-5 rounded-full bg-[#8B4AFF]/10 text-[#8B4AFF] text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <p className="leading-relaxed">Chọn <strong>Bác bỏ</strong> nếu báo cáo không chính xác, hoặc <strong>Giải quyết</strong> để hoàn tất xử lý.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-0 outline-none">
          {/* Time-Range Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-[#E8E3DD] dark:border-zinc-800/80 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#FF5A36]" />
                Phạm vi thống kê báo cáo
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Lọc dữ liệu báo cáo hệ thống theo các mốc thời gian khác nhau</p>
            </div>
            
            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl w-fit border border-muted/30 self-start sm:self-auto">
              {[
                { value: 'today', label: 'Hôm nay' },
                { value: '7d', label: '7 ngày qua' },
                { value: '30d', label: '30 ngày qua' },
                { value: 'all', label: 'Toàn thời gian' }
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setTimeRange(btn.value)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-300 ${
                    timeRange === btn.value
                      ? 'bg-white dark:bg-zinc-900 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {isAnalyticsLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground animate-pulse">
              Đang tải dữ liệu thống kê...
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Matching timeline chart (Col span 2) */}
              <Card className="lg:col-span-2 border-muted/70 bg-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-muted/50 pb-4 p-5">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Biểu đồ hiệu suất ghép đôi (Matching)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tần suất ghép đôi thành công và thất bại/bỏ qua qua thời gian
                    </CardDescription>
                  </div>
                  <Badge className="text-[10px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/10 shadow-none px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Tỷ lệ thành công: {analyticsData?.summary?.successRate ?? 0}%
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4 border-b border-muted/50 pb-5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng số lượt ghép đôi</p>
                      <p className="text-xl font-black text-foreground">{(analyticsData?.summary?.totalMatches ?? 0).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="space-y-1 border-l border-muted/65 pl-4">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Thành công
                      </p>
                      <p className="text-xl font-black text-foreground">{(analyticsData?.summary?.successMatches ?? 0).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="space-y-1 border-l border-muted/65 pl-4">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Thất bại/Bỏ qua
                      </p>
                      <p className="text-xl font-black text-foreground">{(analyticsData?.summary?.failedMatches ?? 0).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <MatchingChart timeline={analyticsData?.matchingTimeline} />
                  </div>
                </CardContent>
              </Card>

              {/* Right column: Relationships and Feature Usage (Col span 1) */}
              <div className="space-y-6">
                {/* Relationship Donut Card */}
                <Card className="border-muted/70 bg-card overflow-hidden">
                  <CardHeader className="border-b border-muted/50 pb-4 p-5">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Heart className="h-4.5 w-4.5 text-rose-500" />
                      Xác nhận mối quan hệ
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tỷ lệ trạng thái kết đôi yêu cầu từ các cặp đôi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <RelationshipDonutChart summary={analyticsData?.summary} />
                  </CardContent>
                </Card>

                {/* Feature Usage Card */}
                <Card className="border-muted/70 bg-card overflow-hidden">
                  <CardHeader className="border-b border-muted/50 pb-4 p-5">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-[#8B4AFF]" />
                      Chức năng sử dụng nhiều
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Đo lường tần suất người dùng truy cập các khu vực trải nghiệm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <FeatureUsageChart usage={analyticsData?.featureUsage} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      {selectedReport && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md p-6 rounded-2xl overflow-hidden gap-5">
            <DialogHeader className="pb-4 border-b border-muted/60">
              <DialogTitle className="flex items-center gap-3 text-lg font-bold text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span>Chi tiết báo cáo vi phạm</span>
                  <span className="text-xs font-normal text-muted-foreground mt-0.5">
                    Kiểm tra nội dung báo cáo & xử lý tài khoản
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-1 text-sm">
              {/* Reason and Description Card */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Lý do báo cáo</span>
                  <Badge className={`gap-1 py-0.5 px-2 text-[9px] shadow-none rounded-full font-bold uppercase ${reportStatusConfig[selectedReport.status]?.className}`}>
                    {reportStatusConfig[selectedReport.status]?.label || selectedReport.status}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-rose-950">
                  {reasonConfig[selectedReport.reason] || selectedReport.reason}
                </p>
                {selectedReport.description && (
                  <div className="text-xs text-rose-900 bg-white/70 p-3 rounded-lg border border-rose-100/50 italic leading-relaxed">
                    "{selectedReport.description}"
                  </div>
                )}
              </div>

              {/* Involved Users Details Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Reporter card */}
                <div className="rounded-xl border border-muted bg-muted/20 p-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Người báo cáo</span>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate">{selectedReport.reporter?.name || '—'}</p>
                    <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">{selectedReport.reporter?.email || '—'}</p>
                  </div>
                </div>

                {/* Accused User card */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/10 p-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Người bị tố cáo</span>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate">{selectedReport.targetUser?.name || '—'}</p>
                    <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">{selectedReport.targetUser?.email || '—'}</p>
                    <div className="mt-1.5">
                      {selectedReport.targetUser?.isActive === false ? (
                        <Badge className="py-0 px-2 text-[9px] bg-rose-100 text-rose-700 border-none font-bold rounded-full">Đã bị khóa</Badge>
                      ) : (
                        <Badge className="py-0 px-2 text-[9px] bg-emerald-100 text-emerald-700 border-none font-bold rounded-full">Đang hoạt động</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2 sm:justify-between w-full border-t border-muted/60 pt-4">
              {/* Ban action */}
              {selectedReport.targetUser?.isActive !== false && (
                <Button
                  variant="destructive"
                  className="sm:mr-auto rounded-full text-xs h-9 hover:bg-rose-600 transition-all font-semibold"
                  disabled={moderateMutation.isLoading}
                  onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'BAN_USER' })}
                >
                  <ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" />
                  Khóa User này
                </Button>
              )}

              <div className="flex flex-wrap gap-2 justify-end">
                {selectedReport.status === 'CREATED' && (
                  <Button
                    variant="outline"
                    className="rounded-full text-xs h-9 hover:bg-muted hover:border-muted transition-all font-medium"
                    disabled={moderateMutation.isLoading}
                    onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'REVIEW' })}
                  >
                    Xem xét
                  </Button>
                )}
                {selectedReport.status !== 'RESOLVED' && selectedReport.status !== 'REJECTED' && (
                  <>
                    <Button
                      variant="outline"
                      className="rounded-full text-xs h-9 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-medium"
                      disabled={moderateMutation.isLoading}
                      onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'REJECT' })}
                    >
                      Bác bỏ
                    </Button>
                    <Button
                      className="rounded-full text-xs h-9 bg-[#FF5A36] hover:bg-[#E04F2E] text-white transition-all shadow-sm shadow-primary/20 font-semibold"
                      disabled={moderateMutation.isLoading}
                      onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'RESOLVE' })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
                      Giải quyết
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
