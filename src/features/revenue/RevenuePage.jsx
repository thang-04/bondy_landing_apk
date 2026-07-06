import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  CreditCard,
  BarChart3,
  History,
  Download,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// ===== Helpers định dạng tiền VND =====
const formatVND = (n) => `${(n ?? 0).toLocaleString('vi-VN')} ₫`

const formatCompactVND = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace('.0', '')} tỷ`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')} tr`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

const formatDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ===== Cấu hình gói đăng ký (đồng bộ giá với server SePay) =====
const tierConfig = {
  PLUS: {
    name: 'Bondy Plus',
    price: 39000,
    color: '#3B82F6',
    badge: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
  },
  PREMIUM: {
    name: 'Bondy Premium',
    price: 199000,
    color: '#8B4AFF',
    badge: 'bg-violet-500/10 text-violet-600 border border-violet-500/20',
  },
  ELITE: {
    name: 'Bondy Elite',
    price: 399000,
    color: '#F59E0B',
    badge: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  },
}

// ===== Cấu hình trạng thái thanh toán (khớp PaymentStatus phía server) =====
const paymentStatusConfig = {
  PAID: { label: 'Đã thanh toán', className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', icon: CheckCircle2 },
  PENDING: { label: 'Đang chờ', className: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', icon: Clock },
  EXPIRED: { label: 'Hết hạn', className: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20', icon: XCircle },
  CANCELLED: { label: 'Đã hủy', className: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20', icon: XCircle },
  FAILED: { label: 'Thất bại', className: 'bg-rose-500/10 text-rose-600 border border-rose-500/20', icon: XCircle },
}

// ===== Sinh dữ liệu doanh thu mô phỏng theo khoảng thời gian =====
function getMockRevenueData(range) {
  // Mỗi dòng: [nhãn, số đơn PLUS, số đơn PREMIUM, số đơn ELITE]
  const rowsByRange = {
    today: [
      ['02h', 1, 0, 0], ['04h', 0, 0, 0], ['06h', 1, 0, 0], ['08h', 3, 1, 0],
      ['10h', 4, 1, 1], ['12h', 5, 2, 0], ['14h', 3, 1, 0], ['16h', 4, 2, 1],
      ['18h', 6, 2, 1], ['20h', 8, 3, 1], ['22h', 4, 1, 0], ['24h', 2, 0, 0],
    ],
    '7d': [
      ['Thứ 2', 14, 4, 1], ['Thứ 3', 18, 5, 2], ['Thứ 4', 22, 7, 2],
      ['Thứ 5', 19, 6, 1], ['Thứ 6', 26, 8, 3], ['Thứ 7', 32, 11, 4],
      ['Chủ Nhật', 35, 12, 5],
    ],
    '30d': [
      ['Tuần 1', 95, 32, 10], ['Tuần 2', 110, 38, 12],
      ['Tuần 3', 128, 44, 15], ['Tuần 4', 145, 52, 18],
    ],
    all: [
      ['Tháng 1', 320, 105, 30], ['Tháng 2', 385, 128, 38],
      ['Tháng 3', 450, 152, 45], ['Tháng 4', 520, 178, 55],
      ['Tháng 5', 610, 215, 68], ['Tháng 6', 730, 260, 85],
    ],
  }

  const rows = rowsByRange[range] || rowsByRange['7d']

  const timeline = []
  const tierTotals = {
    PLUS: { count: 0, revenue: 0 },
    PREMIUM: { count: 0, revenue: 0 },
    ELITE: { count: 0, revenue: 0 },
  }

  for (const [label, plus, premium, elite] of rows) {
    const revenue =
      plus * tierConfig.PLUS.price +
      premium * tierConfig.PREMIUM.price +
      elite * tierConfig.ELITE.price
    timeline.push({ label, revenue, paidCount: plus + premium + elite })
    tierTotals.PLUS.count += plus
    tierTotals.PLUS.revenue += plus * tierConfig.PLUS.price
    tierTotals.PREMIUM.count += premium
    tierTotals.PREMIUM.revenue += premium * tierConfig.PREMIUM.price
    tierTotals.ELITE.count += elite
    tierTotals.ELITE.revenue += elite * tierConfig.ELITE.price
  }

  const totalRevenue = timeline.reduce((acc, t) => acc + t.revenue, 0)
  const paidCount = timeline.reduce((acc, t) => acc + t.paidCount, 0)

  const extraByRange = {
    today: { pendingCount: 6, failedCount: 3, growthPercent: 8.4 },
    '7d': { pendingCount: 14, failedCount: 9, growthPercent: 12.6 },
    '30d': { pendingCount: 42, failedCount: 28, growthPercent: 15.2 },
    all: { pendingCount: 120, failedCount: 85, growthPercent: 18.9 },
  }
  const extra = extraByRange[range] || extraByRange['7d']

  const summary = {
    totalRevenue,
    paidCount,
    pendingCount: extra.pendingCount,
    failedCount: extra.failedCount,
    avgOrderValue: paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0,
    growthPercent: extra.growthPercent,
  }

  const byTier = Object.entries(tierTotals).map(([tier, t]) => ({
    tier,
    name: tierConfig[tier].name,
    count: t.count,
    revenue: t.revenue,
  }))

  // Lịch sử giao dịch mô phỏng (mới nhất trước)
  const now = Date.now()
  const hours = (h) => new Date(now - h * 3600_000).toISOString()
  const mockTx = [
    ['BONDYK3J9F2QX', 'Minh Thư', 'minhthu@gmail.com', 'PREMIUM', 'PAID', 1],
    ['BONDYA7M2P5RD', 'Hoàng Nam', 'hoangnam.dev@gmail.com', 'PLUS', 'PAID', 3],
    ['BONDYQ8T4W6ZE', 'Thanh Hà', 'thanhha95@gmail.com', 'ELITE', 'PAID', 5],
    ['BONDYH2N7V9SF', 'Tuấn Tú', 'tuantu.work@gmail.com', 'PLUS', 'PENDING', 6],
    ['BONDYB5X1C8LG', 'Ngọc Lan', 'ngoclan.ng@gmail.com', 'PLUS', 'PAID', 9],
    ['BONDYD9K6R3MH', 'Anh Đức', 'anhduc.le@gmail.com', 'PREMIUM', 'PAID', 12],
    ['BONDYF4W8J2TI', 'Thu Trang', 'thutrang.p@gmail.com', 'PLUS', 'EXPIRED', 16],
    ['BONDYM1S5Y7QJ', 'Minh Quân', 'minhquan.vo@gmail.com', 'ELITE', 'PAID', 20],
    ['BONDYP6Z3E9NK', 'Phương Thảo', 'pthao.nguyen@gmail.com', 'PLUS', 'PAID', 26],
    ['BONDYT2C7U4WL', 'Tiến Dũng', 'tiendung.tr@gmail.com', 'PREMIUM', 'FAILED', 31],
    ['BONDYV8B4I1XM', 'Khánh Linh', 'khanhlinh.dt@gmail.com', 'PLUS', 'PAID', 38],
    ['BONDYR3G9O6ZN', 'Quốc Bảo', 'quocbao.h@gmail.com', 'PLUS', 'CANCELLED', 45],
    ['BONDYL7D2A5VO', 'Hải Yến', 'haiyen.vu@gmail.com', 'PREMIUM', 'PAID', 52],
    ['BONDYY4H8Q1BP', 'Đức Thịnh', 'ducthinh.ng@gmail.com', 'ELITE', 'PAID', 61],
    ['BONDYW9E5N3KQ', 'Mai Anh', 'maianh.tran@gmail.com', 'PLUS', 'PAID', 70],
  ]

  const transactions = mockTx.map(([code, userName, userEmail, tier, status, hoursAgo], idx) => ({
    id: `mock-${idx}`,
    code,
    userName,
    userEmail,
    tier,
    amount: tierConfig[tier].price,
    status,
    gateway: status === 'PAID' ? 'MBBank' : null,
    referenceCode: status === 'PAID' ? `FT${25000000 + idx * 137}` : null,
    createdAt: hours(hoursAgo + 1),
    paidAt: status === 'PAID' ? hours(hoursAgo) : null,
  }))

  return { summary, timeline, byTier, transactions }
}

// ===== Biểu đồ vùng SVG: Doanh thu theo thời gian =====
function RevenueAreaChart({ timeline }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Chưa có dữ liệu doanh thu trong khoảng thời gian này
      </div>
    )
  }

  const maxVal = Math.max(10000, ...timeline.map((d) => d.revenue)) * 1.15

  const svgWidth = 600
  const svgHeight = 220
  const padding = { top: 20, right: 20, bottom: 40, left: 52 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom

  const points = timeline.map((d, i) => {
    const x = padding.left + (timeline.length > 1 ? (i / (timeline.length - 1)) * chartWidth : chartWidth / 2)
    const y = padding.top + chartHeight - (d.revenue / maxVal) * chartHeight
    return { x, y, label: d.label, revenue: d.revenue, paidCount: d.paidCount }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const val = Math.round((maxVal / 3) * i)
    const y = padding.top + chartHeight - (val / maxVal) * chartHeight
    return { y, val }
  })

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" className="overflow-visible select-none">
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5A36" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B4AFF" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF5A36" />
            <stop offset="100%" stopColor="#8B4AFF" />
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
              className="text-zinc-200"
            />
            <text
              x={padding.left - 10}
              y={g.y + 3}
              textAnchor="end"
              className="text-[9px] font-medium fill-muted-foreground"
            >
              {formatCompactVND(g.val)}
            </text>
          </g>
        ))}

        {/* Area & Line */}
        <path d={areaPath} fill="url(#revenueGradient)" className="transition-all duration-500" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#revenueLineGradient)"
          strokeWidth={2.5}
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
                  className="text-zinc-200"
                />
              )}

              {(isHovered || points.length <= 15) && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3.5}
                  fill="#FF5A36"
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
          className="absolute z-20 pointer-events-none rounded-xl border border-muted bg-white p-3 shadow-lg backdrop-blur-sm text-xs space-y-1.5 min-w-[160px] transition-all duration-100"
          style={{
            left: `${Math.min(85, Math.max(15, (points[hoveredIdx].x / svgWidth) * 100))}%`,
            top: '0px',
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-bold text-foreground border-b border-muted/50 pb-1">{points[hoveredIdx].label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium text-[#FF5A36]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36]" />
              Doanh thu:
            </span>
            <span className="font-black text-foreground">{formatVND(points[hoveredIdx].revenue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Giao dịch:
            </span>
            <span className="font-black text-foreground">{points[hoveredIdx].paidCount.toLocaleString('vi-VN')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Biểu đồ tròn (Donut): Doanh thu theo gói =====
function TierRevenueDonutChart({ byTier }) {
  if (!byTier || byTier.length === 0) return null

  const total = byTier.reduce((acc, d) => acc + d.revenue, 0)
  const radius = 40
  const strokeWidth = 8.5
  const circumference = 2 * Math.PI * radius
  const center = 60

  const donutSlices = []
  let accumulatedPercentage = 0
  for (const d of byTier) {
    const percentage = total > 0 ? (d.revenue / total) * 100 : 0
    const strokeLength = (percentage / 100) * circumference
    const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference
    accumulatedPercentage += percentage
    donutSlices.push({ ...d, strokeLength, strokeOffset, percentage, color: tierConfig[d.tier]?.color || '#6B7280' })
  }

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
            className="text-zinc-100"
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
          <span className="text-sm font-black text-foreground leading-none">
            {formatCompactVND(total)}
          </span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Doanh thu
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 min-w-[160px] w-full">
        {donutSlices.map((d, i) => (
          <div key={i} className="flex items-center justify-between border-b border-muted/50 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs font-semibold text-muted-foreground">{d.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-foreground">{formatVND(d.revenue)}</span>
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

// ===== Biểu đồ thanh ngang: Số giao dịch theo gói =====
function TierCountBarChart({ byTier }) {
  if (!byTier || byTier.length === 0) return null
  const total = byTier.reduce((acc, t) => acc + t.count, 0) || 1

  return (
    <div className="space-y-4 py-1">
      {byTier.map((t, idx) => {
        const pct = Math.round((t.count / total) * 1000) / 10
        const color = tierConfig[t.tier]?.color || '#6B7280'
        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{t.name}</span>
              <span className="text-muted-foreground font-semibold">
                {t.count.toLocaleString('vi-VN')} giao dịch ({pct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden relative border border-muted/30">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

async function fetchRevenue(range) {
  try {
    const res = await api.get('/admin/revenue', { params: { range } })
    const body = res.data
    if (body && body.success && body.data) return body.data
    return { ...getMockRevenueData(range), isMock: true }
  } catch (e) {
    console.warn('API `/admin/revenue` chưa hoạt động. Đang sử dụng Mock Data.', e)
    return { ...getMockRevenueData(range), isMock: true }
  }
}

export function RevenuePage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['admin', 'revenue', timeRange],
    queryFn: () => fetchRevenue(timeRange),
    refetchInterval: 60_000,
  })

  const summary = revenueData?.summary
  const transactions = revenueData?.transactions ?? []

  const filteredTransactions = useMemo(() => {
    const searchLower = search.trim().toLowerCase()
    return transactions.filter((tx) => {
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false
      if (!searchLower) return true
      return (
        (tx.code || '').toLowerCase().includes(searchLower) ||
        (tx.userName || '').toLowerCase().includes(searchLower) ||
        (tx.userEmail || '').toLowerCase().includes(searchLower) ||
        (tx.referenceCode || '').toLowerCase().includes(searchLower)
      )
    })
  }, [transactions, search, statusFilter])

  const handleExportCsv = () => {
    const header = ['Mã giao dịch', 'Người dùng', 'Email', 'Gói', 'Số tiền (VND)', 'Trạng thái', 'Thời gian']
    const rows = filteredTransactions.map((tx) => [
      tx.code,
      tx.userName || '',
      tx.userEmail || '',
      tierConfig[tx.tier]?.name || tx.tier,
      tx.amount,
      paymentStatusConfig[tx.status]?.label || tx.status,
      formatDateTime(tx.paidAt || tx.createdAt),
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bondy-doanh-thu-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const kpiCards = summary
    ? [
        {
          label: 'Tổng doanh thu',
          value: formatVND(summary.totalRevenue),
          hint: summary.growthPercent != null ? `+${summary.growthPercent}% so với kỳ trước` : 'trong khoảng đã chọn',
          icon: Wallet,
          gradient: 'from-[#FF5A36]/8 to-transparent border-t-2 border-t-[#FF5A36]/60',
          iconBg: 'bg-[#FF5A36]/10 text-[#FF5A36]',
        },
        {
          label: 'Giao dịch thành công',
          value: (summary.paidCount ?? 0).toLocaleString('vi-VN'),
          hint: 'đã nhận tiền qua SePay',
          icon: CheckCircle2,
          gradient: 'from-[#10B981]/8 to-transparent border-t-2 border-t-[#10B981]/60',
          iconBg: 'bg-[#10B981]/10 text-[#10B981]',
        },
        {
          label: 'Đang chờ thanh toán',
          value: (summary.pendingCount ?? 0).toLocaleString('vi-VN'),
          hint: 'đơn VietQR chưa chuyển khoản',
          icon: Clock,
          gradient: 'from-[#F59E0B]/8 to-transparent border-t-2 border-t-[#F59E0B]/60',
          iconBg: 'bg-[#F59E0B]/10 text-[#F59E0B]',
        },
        {
          label: 'Thất bại / Hết hạn',
          value: (summary.failedCount ?? 0).toLocaleString('vi-VN'),
          hint: 'gồm đơn hủy, hết hạn, lỗi',
          icon: XCircle,
          gradient: 'from-[#EF4444]/8 to-transparent border-t-2 border-t-[#EF4444]/60',
          iconBg: 'bg-[#EF4444]/10 text-[#EF4444]',
        },
        {
          label: 'Giá trị TB / giao dịch',
          value: formatVND(summary.avgOrderValue),
          hint: 'doanh thu ÷ số giao dịch',
          icon: TrendingUp,
          gradient: 'from-[#8B4AFF]/8 to-transparent border-t-2 border-t-[#8B4AFF]/60',
          iconBg: 'bg-[#8B4AFF]/10 text-[#8B4AFF]',
        },
      ]
    : []

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF5A36]/8 via-[#EA2A5A]/6 to-[#8B4AFF]/8 p-6 md:p-8 border border-[#FF5A36]/10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Doanh thu &{' '}
            <span className="bg-gradient-to-r from-[#FF5A36] to-[#8B4AFF] bg-clip-text text-transparent">Thanh toán</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Theo dõi lịch sử doanh thu từ các gói đăng ký Bondy Plus / Premium / Elite qua SePay VietQR. Số liệu tự
            động làm mới sau mỗi 60 giây.
          </p>
        </div>

        <div className="absolute right-12 top-0 h-28 w-28 rounded-full bg-[#FF5A36]/10 blur-2xl pointer-events-none" />
        <div className="absolute right-36 bottom-0 h-24 w-24 rounded-full bg-[#8B4AFF]/10 blur-2xl pointer-events-none" />
      </div>

      {/* Bộ chọn khoảng thời gian */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 bg-zinc-100/80 border border-[#E8E3DD] p-1 rounded-xl">
          {[
            { value: 'today', label: 'Hôm nay' },
            { value: '7d', label: '7 ngày qua' },
            { value: '30d', label: '30 ngày qua' },
            { value: 'all', label: 'Toàn thời gian' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setTimeRange(btn.value)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-300 ${
                timeRange === btn.value
                  ? 'bg-white text-zinc-900 shadow-sm border border-[#E8E3DD]'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {revenueData?.isMock && (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
            Dữ liệu mô phỏng — API /admin/revenue chưa sẵn sàng
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {kpiCards.map((c) => {
              const Icon = c.icon
              return (
                <Card
                  key={c.label}
                  className={`overflow-hidden border border-muted/70 bg-card text-card-foreground admin-card-hover bg-gradient-to-br ${c.gradient}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </CardTitle>
                    <div className={`p-2.5 rounded-xl ${c.iconBg} transition-all duration-300`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <div className="text-xl font-extrabold tracking-tight text-foreground truncate" title={String(c.value)}>
                      {c.value}
                    </div>
                    <p className="text-[11px] font-semibold text-muted-foreground mt-1">{c.hint}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Tabs defaultValue="chart" className="space-y-6">
            <div className="border-b border-[#E8E3DD] pb-1">
              <TabsList className="bg-zinc-100/80 border border-[#E8E3DD] p-1 rounded-xl inline-flex gap-1">
                <TabsTrigger
                  value="chart"
                  className="rounded-lg px-5 py-2 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <BarChart3 className="h-4 w-4" />
                  Biểu đồ doanh thu
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-lg px-5 py-2 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <History className="h-4 w-4" />
                  Lịch sử giao dịch
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ===== Tab Biểu đồ ===== */}
            <TabsContent value="chart" className="space-y-6 mt-0 outline-none">
              <Card className="border border-muted/70 bg-card admin-card-hover">
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#FF5A36]" />
                    Doanh thu theo thời gian
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tổng tiền đã nhận (VND) từ các giao dịch thanh toán thành công
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <RevenueAreaChart timeline={revenueData?.timeline} />
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-muted/70 bg-card admin-card-hover">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#8B4AFF]" />
                      Doanh thu theo gói
                    </CardTitle>
                    <CardDescription className="text-xs">Tỷ trọng đóng góp của từng gói đăng ký</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-2">
                    <TierRevenueDonutChart byTier={revenueData?.byTier} />
                  </CardContent>
                </Card>

                <Card className="border border-muted/70 bg-card admin-card-hover">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#3B82F6]" />
                      Số giao dịch theo gói
                    </CardTitle>
                    <CardDescription className="text-xs">Lượng đơn thanh toán thành công của từng gói</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-2">
                    <TierCountBarChart byTier={revenueData?.byTier} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ===== Tab Lịch sử giao dịch ===== */}
            <TabsContent value="history" className="space-y-4 mt-0 outline-none">
              <Card className="border border-muted/70 bg-card">
                <CardHeader className="p-5 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                        <History className="h-4 w-4 text-[#FF5A36]" />
                        Lịch sử giao dịch
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {filteredTransactions.length.toLocaleString('vi-VN')} giao dịch
                        {statusFilter !== 'ALL' ? ` (lọc: ${paymentStatusConfig[statusFilter]?.label})` : ''}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCsv}
                      disabled={filteredTransactions.length === 0}
                      className="text-xs font-bold gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Xuất CSV
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo mã GD, tên, email..."
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                    <div className="inline-flex items-center gap-1 bg-zinc-100/80 border border-[#E8E3DD] p-1 rounded-xl">
                      {[
                        { value: 'ALL', label: 'Tất cả' },
                        { value: 'PAID', label: 'Thành công' },
                        { value: 'PENDING', label: 'Đang chờ' },
                        { value: 'EXPIRED', label: 'Hết hạn' },
                        { value: 'FAILED', label: 'Thất bại' },
                        { value: 'CANCELLED', label: 'Đã hủy' },
                      ].map((btn) => (
                        <button
                          key={btn.value}
                          onClick={() => setStatusFilter(btn.value)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all duration-300 ${
                            statusFilter === btn.value
                              ? 'bg-white text-zinc-900 shadow-sm border border-[#E8E3DD]'
                              : 'text-zinc-500 hover:text-zinc-900'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-5 text-xs font-bold">Mã giao dịch</TableHead>
                        <TableHead className="text-xs font-bold">Người dùng</TableHead>
                        <TableHead className="text-xs font-bold">Gói</TableHead>
                        <TableHead className="text-xs font-bold text-right">Số tiền</TableHead>
                        <TableHead className="text-xs font-bold text-center">Trạng thái</TableHead>
                        <TableHead className="pr-5 text-xs font-bold text-right">Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
                            Không tìm thấy giao dịch nào phù hợp
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((tx) => {
                          const statusCfg = paymentStatusConfig[tx.status] || paymentStatusConfig.PENDING
                          const StatusIcon = statusCfg.icon
                          const tierCfg = tierConfig[tx.tier]
                          return (
                            <TableRow key={tx.id} className="hover:bg-zinc-50/80">
                              <TableCell className="pl-5">
                                <div className="font-mono text-xs font-bold text-foreground">{tx.code}</div>
                                {tx.referenceCode && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {tx.gateway ? `${tx.gateway} · ` : ''}
                                    {tx.referenceCode}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-xs font-bold text-foreground">{tx.userName || '—'}</div>
                                <div className="text-[10px] text-muted-foreground">{tx.userEmail || ''}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] font-bold ${tierCfg?.badge || 'bg-zinc-500/10 text-zinc-600'}`}>
                                  {tierCfg?.name || tx.tier}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-xs font-extrabold text-foreground whitespace-nowrap">
                                {formatVND(tx.amount)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`text-[10px] font-bold inline-flex items-center gap-1 ${statusCfg.className}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusCfg.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="pr-5 text-right text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                                {formatDateTime(tx.paidAt || tx.createdAt)}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
