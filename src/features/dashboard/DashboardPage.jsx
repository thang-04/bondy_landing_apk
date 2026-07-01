import { useState, useEffect } from 'react'
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
  SlidersHorizontal,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
      chatAcceptedMatches: 440,
      chatConversionRate: 69.8,
      responseLatencyMinutes: 12,
      likesCount: 1540,
      passesCount: 890,
      totalRelationships: 48,
      relationshipPending: 10,
      relationshipConfirmed: 32,
      relationshipDeclined: 6,
      courseCompletionRate: 65.4,
      freeSubsCount: 380,
      plusSubsCount: 120,
      premiumSubsCount: 90,
      eliteSubsCount: 40,
      premiumRate: 39.7,
      referralsCount: 18,
      promosCount: 12,
      aiAdoptionRate: 72.5
    },
    '7d': {
      totalMatches: 1718,
      successMatches: 1390,
      failedMatches: 328,
      successRate: 80.9,
      chatAcceptedMatches: 1220,
      chatConversionRate: 71.0,
      responseLatencyMinutes: 15,
      likesCount: 5640,
      passesCount: 3120,
      totalRelationships: 320,
      relationshipPending: 45,
      relationshipConfirmed: 245,
      relationshipDeclined: 30,
      courseCompletionRate: 68.2,
      freeSubsCount: 350,
      plusSubsCount: 125,
      premiumSubsCount: 95,
      eliteSubsCount: 60,
      premiumRate: 44.4,
      referralsCount: 52,
      promosCount: 35,
      aiAdoptionRate: 74.8
    },
    '30d': {
      totalMatches: 5370,
      successMatches: 4180,
      failedMatches: 1190,
      successRate: 77.8,
      chatAcceptedMatches: 3680,
      chatConversionRate: 68.5,
      responseLatencyMinutes: 18,
      likesCount: 22400,
      passesCount: 12800,
      totalRelationships: 1250,
      relationshipPending: 180,
      relationshipConfirmed: 920,
      relationshipDeclined: 150,
      courseCompletionRate: 71.5,
      freeSubsCount: 320,
      plusSubsCount: 130,
      premiumSubsCount: 105,
      eliteSubsCount: 75,
      premiumRate: 49.2,
      referralsCount: 195,
      promosCount: 140,
      aiAdoptionRate: 76.2
    },
    all: {
      totalMatches: 37550,
      successMatches: 30300,
      failedMatches: 7250,
      successRate: 80.7,
      chatAcceptedMatches: 25400,
      chatConversionRate: 67.6,
      responseLatencyMinutes: 22,
      likesCount: 154000,
      passesCount: 88500,
      totalRelationships: 8450,
      relationshipPending: 850,
      relationshipConfirmed: 6600,
      relationshipDeclined: 1000,
      courseCompletionRate: 75.0,
      freeSubsCount: 280,
      plusSubsCount: 140,
      premiumSubsCount: 120,
      eliteSubsCount: 90,
      premiumRate: 55.6,
      referralsCount: 1420,
      promosCount: 980,
      aiAdoptionRate: 81.3
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

  const moodShareData = {
    today: [
      { mood: 'Bình yên', count: 18, percentage: 37.5 },
      { mood: 'Hạnh phúc', count: 15, percentage: 31.3 },
      { mood: 'Mệt mỏi', count: 10, percentage: 20.8 },
      { mood: 'Lo âu', count: 5, percentage: 10.4 }
    ],
    '7d': [
      { mood: 'Bình yên', count: 128, percentage: 40.0 },
      { mood: 'Hạnh phúc', count: 96, percentage: 30.0 },
      { mood: 'Mệt mỏi', count: 64, percentage: 20.0 },
      { mood: 'Lo âu', count: 32, percentage: 10.0 }
    ],
    '30d': [
      { mood: 'Bình yên', count: 512, percentage: 41.0 },
      { mood: 'Hạnh phúc', count: 375, percentage: 30.0 },
      { mood: 'Mệt mỏi', count: 238, percentage: 19.0 },
      { mood: 'Lo âu', count: 125, percentage: 10.0 }
    ],
    all: [
      { mood: 'Bình yên', count: 3549, percentage: 42.0 },
      { mood: 'Hạnh phúc', count: 2535, percentage: 30.0 },
      { mood: 'Mệt mỏi', count: 1521, percentage: 18.0 },
      { mood: 'Lo âu', count: 845, percentage: 10.0 }
    ]
  }

  const aiCoachTonesData = {
    today: [
      { tone: 'Thấu cảm', count: 65, percentage: 46.4 },
      { tone: 'Hài hước', count: 35, percentage: 25.0 },
      { tone: 'Nghiêm túc', count: 25, percentage: 17.9 },
      { tone: 'Lắng nghe', count: 15, percentage: 10.7 }
    ],
    '7d': [
      { tone: 'Thấu cảm', count: 420, percentage: 45.2 },
      { tone: 'Hài hước', count: 245, percentage: 26.3 },
      { tone: 'Nghiêm túc', count: 165, percentage: 17.7 },
      { tone: 'Lắng nghe', count: 100, percentage: 10.8 }
    ],
    '30d': [
      { tone: 'Thấu cảm', count: 1850, percentage: 46.3 },
      { tone: 'Hài hước', count: 1050, percentage: 26.3 },
      { tone: 'Nghiêm túc', count: 680, percentage: 17.0 },
      { tone: 'Lắng nghe', count: 420, percentage: 10.5 }
    ],
    all: [
      { tone: 'Thấu cảm', count: 13500, percentage: 46.7 },
      { tone: 'Hài hước', count: 7500, percentage: 26.0 },
      { tone: 'Nghiêm túc', count: 4900, percentage: 17.0 },
      { tone: 'Lắng nghe', count: 3000, percentage: 10.3 }
    ]
  }

  const rangeKey = timelineData[range] ? range : '7d'
  
  const scale = range === 'today' ? 0.1 : range === '7d' ? 0.5 : range === '30d' ? 2 : 15;
  const scaleInt = (val) => Math.max(1, Math.round(val * scale));

  const demographics = {
    gender: [
      { gender: 'Nam', count: scaleInt(320) },
      { gender: 'Nữ', count: scaleInt(480) },
      { gender: 'Khác', count: scaleInt(50) }
    ],
    datingGoal: [
      { goal: 'Tìm bạn đời', count: scaleInt(450) },
      { goal: 'Trò chuyện chia sẻ', count: scaleInt(250) },
      { goal: 'Hẹn hò lãng mạn', count: scaleInt(150) },
      { goal: 'Chưa xác định', count: scaleInt(80) }
    ],
    zodiac: [
      { zodiac: 'Bạch Dương', count: scaleInt(90) },
      { zodiac: 'Kim Ngưu', count: scaleInt(85) },
      { zodiac: 'Song Tử', count: scaleInt(72) },
      { zodiac: 'Cự Giải', count: scaleInt(64) },
      { zodiac: 'Sư Tử', count: scaleInt(55) }
    ],
    city: [
      { city: 'Hà Nội', count: scaleInt(350) },
      { city: 'TP. Hồ Chí Minh', count: scaleInt(420) },
      { city: 'Đà Nẵng', count: scaleInt(120) },
      { city: 'Cần Thơ', count: scaleInt(80) },
      { city: 'Hải Phòng', count: scaleInt(60) }
    ],
    age: [
      { range: '< 18', count: scaleInt(45) },
      { range: '18 - 24', count: scaleInt(280) },
      { range: '25 - 34', count: scaleInt(390) },
      { range: '35 - 44', count: scaleInt(110) },
      { range: '45+', count: scaleInt(25) }
    ]
  };

  const messaging = {
    types: [
      { type: 'TEXT', count: scaleInt(8500) },
      { type: 'IMAGE', count: scaleInt(1200) },
      { type: 'VOICE', count: scaleInt(950) },
      { type: 'VIDEO', count: scaleInt(150) },
      { type: 'GIF', count: scaleInt(450) }
    ],
    avgVoiceDurationSeconds: 18,
    topReactions: [
      { emoji: '❤️', count: scaleInt(1240) },
      { emoji: '👍', count: scaleInt(850) },
      { emoji: '😂', count: scaleInt(620) },
      { emoji: '🔥', count: scaleInt(430) },
      { emoji: '🙌', count: scaleInt(250) }
    ]
  };

  const relationshipDetails = {
    avgStreakDays: range === 'today' ? 12 : range === '7d' ? 14 : range === '30d' ? 19 : 24,
    topStreaks: [
      { streakDays: scaleInt(45) > 100 ? 145 : scaleInt(45) + 12, names: 'Minh Thư & Hoàng Nam' },
      { streakDays: scaleInt(38) > 100 ? 112 : scaleInt(38) + 10, names: 'Thanh Hà & Tuấn Tú' },
      { streakDays: scaleInt(29) > 100 ? 95 : scaleInt(29) + 8, names: 'Ngọc Lan & Anh Đức' },
      { streakDays: scaleInt(22) > 100 ? 82 : scaleInt(22) + 6, names: 'Thu Trang & Minh Quân' },
      { streakDays: scaleInt(18) > 100 ? 70 : scaleInt(18) + 5, names: 'Phương Thảo & Tiến Dũng' }
    ],
    moods: [
      { mood: 'Hạnh phúc', count: scaleInt(42) },
      { mood: 'Vui vẻ', count: scaleInt(35) },
      { mood: 'Bình ổn', count: scaleInt(28) },
      { mood: 'Trầm lặng', count: scaleInt(12) },
      { mood: 'Có mâu thuẫn', count: scaleInt(5) }
    ],
    dailyActionCompletionRate: range === 'today' ? 70.5 : range === '7d' ? 72.8 : range === '30d' ? 75.2 : 79.4
  };

  const aiPerformance = {
    avgLatencySeconds: range === 'today' ? 1.6 : range === '7d' ? 1.8 : range === '30d' ? 2.1 : 2.4,
    totalTokensUsed: scaleInt(245000),
    avgRating: range === 'today' ? 4.7 : range === '7d' ? 4.6 : range === '30d' ? 4.5 : 4.4,
    models: [
      { model: 'gpt-4o', count: scaleInt(850) },
      { model: 'gemini-pro', count: scaleInt(420) },
      { model: 'claude-sonnet', count: scaleInt(180) }
    ]
  };

  const healingAssessments = {
    avgRecoveryIntensity: range === 'today' ? 6.5 : range === '7d' ? 6.8 : range === '30d' ? 7.2 : 7.5,
    intents: [
      { intent: 'Khám phá bản thân', count: scaleInt(185) },
      { intent: 'Giải tỏa căng thẳng', count: scaleInt(140) },
      { intent: 'Xây dựng thói quen', count: scaleInt(95) }
    ],
    triggers: [
      { trigger: 'Áp lực công việc', count: scaleInt(210) },
      { trigger: 'Bất đồng quan điểm', count: scaleInt(130) },
      { trigger: 'Cảm xúc cô đơn', count: scaleInt(95) }
    ],
    needs: [
      { need: 'Lắng nghe chia sẻ', count: scaleInt(190) },
      { need: 'Lời khuyên hành động', count: scaleInt(120) },
      { need: 'Bài tập thiền định', count: scaleInt(80) }
    ]
  };

  return {
    summary: summaryData[rangeKey],
    matchingTimeline: timelineData[rangeKey],
    featureUsage: featureUsageData[rangeKey],
    moodShare: moodShareData[rangeKey],
    aiCoachTones: aiCoachTonesData[rangeKey],
    demographics,
    messaging,
    relationshipDetails,
    aiPerformance,
    healingAssessments
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
              className="text-zinc-200"
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
                  className="text-zinc-200"
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
          className="absolute z-20 pointer-events-none rounded-xl border border-muted bg-white p-3 shadow-lg backdrop-blur-sm text-xs space-y-1.5 min-w-[140px] transition-all duration-100"
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
          <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden relative border border-muted/30">
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

// Biểu đồ SVG tỷ lệ Like/Pass
function SwipeRatioChart({ likes, passes }) {
  const total = likes + passes || 1;
  const likePercent = Math.round((likes / total) * 100);

  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const likeLength = (likePercent / 100) * circumference;

  return (
    <div className="flex items-center justify-around gap-4 py-2">
      <div className="relative h-24 w-24 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible select-none">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#E8E3DD" strokeWidth={strokeWidth} />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#FF5A36"
            strokeWidth={strokeWidth}
            strokeDasharray={`${likeLength} ${circumference - likeLength}`}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-black text-foreground">{likePercent}%</span>
          <span className="text-[7px] font-bold text-muted-foreground uppercase">Thích</span>
        </div>
      </div>
      <div className="space-y-2 text-xs flex-1">
        <div className="flex items-center justify-between border-b border-muted/50 pb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[#FF5A36]" /> Like (Thích)
          </span>
          <span className="font-extrabold text-foreground">{likes.toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[#E8E3DD]" /> Pass (Bỏ qua)
          </span>
          <span className="font-extrabold text-foreground">{passes.toLocaleString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}

// Vòng tròn tiến trình tỷ lệ áp dụng AI
function AISuggestionAdoptionRing({ adoptionRate }) {
  const radius = 35;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeLength = (adoptionRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-3">
      <div className="relative h-24 w-24">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible select-none">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F1F1F0" strokeWidth={strokeWidth} />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#8B4AFF"
            strokeWidth={strokeWidth}
            strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-base font-black text-foreground">{adoptionRate}%</span>
          <span className="text-[7px] font-bold text-muted-foreground uppercase">Áp dụng</span>
        </div>
      </div>
      <p className="text-[10px] text-center font-bold text-muted-foreground leading-relaxed">
        Tỷ lệ gợi ý từ AI Coach được người dùng áp dụng gửi đi trong hội thoại
      </p>
    </div>
  );
}

// Vòng tròn tỷ lệ giới tính
function GenderRingChart({ data }) {
  if (!data) return null;
  const total = data.reduce((acc, d) => acc + d.count, 0) || 1;
  const colors = {
    'Nam': '#3B82F6',
    'Nữ': '#EC4899',
    'Khác': '#A855F7',
  };
  
  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPct = 0;
  const slices = [];
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const pct = (d.count / total) * 100;
    const strokeLength = (pct / 100) * circumference;
    const strokeOffset = circumference - ((accumulatedPct / 100) * circumference);
    accumulatedPct += pct;
    slices.push({ ...d, strokeLength, strokeOffset, pct, color: colors[d.gender] || '#6B7280' });
  }

  return (
    <div className="flex items-center justify-around gap-6 py-2">
      <div className="relative h-24 w-24 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible select-none">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F1F1F0" strokeWidth={strokeWidth} />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${slice.strokeLength} ${circumference - slice.strokeLength}`}
              strokeDashoffset={slice.strokeOffset}
              transform="rotate(-90 50 50)"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-black text-foreground">{total.toLocaleString('vi-VN')}</span>
          <span className="text-[7px] font-bold text-muted-foreground uppercase">Hồ sơ</span>
        </div>
      </div>
      <div className="space-y-2 text-xs flex-1">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-muted/50 pb-1 last:border-0 last:pb-0">
            <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} /> {slice.gender}
            </span>
            <span className="font-extrabold text-foreground">{slice.count.toLocaleString('vi-VN')} ({slice.pct.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Biểu đồ độ tuổi dạng cột đứng
function AgeVerticalBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.count), 10);
  
  return (
    <div className="flex items-end justify-between h-40 gap-3 px-2 pt-6">
      {data.map((d, i) => {
        const pct = (d.count / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
            <div className="absolute -top-6 text-[10px] font-extrabold text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {d.count}
            </div>
            <div className="w-full bg-zinc-100 rounded-t-lg overflow-hidden h-28 relative border border-muted/20">
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-[#FF5A36] to-[#EA2A5A] rounded-t-lg transition-all duration-1000 ease-out"
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground text-center whitespace-nowrap">{d.range}</span>
          </div>
        );
      })}
    </div>
  );
}

// Biểu đồ loại tin nhắn sử dụng thanh ngang
function MessageTypeChart({ types }) {
  if (!types || types.length === 0) return null;
  const total = types.reduce((acc, t) => acc + t.count, 0) || 1;
  
  return (
    <div className="space-y-3.5 py-1">
      {types.map((t, idx) => {
        const pct = Math.round((t.count / total) * 1000) / 10;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-foreground">{t.type}</span>
              <span className="text-muted-foreground">
                {t.count.toLocaleString('vi-VN')} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden relative border border-muted/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Biểu đồ cảm xúc cặp đôi (Donut Chart)
function CoupleMoodDonutChart({ moods }) {
  if (!moods || moods.length === 0) return null;
  const total = moods.reduce((acc, m) => acc + m.count, 0) || 1;
  const colors = {
    'Hạnh phúc': '#10B981',
    'Vui vẻ': '#34D399',
    'Bình ổn': '#60A5FA',
    'Trầm lặng': '#F59E0B',
    'Có mâu thuẫn': '#EF4444',
    'Khác': '#9CA3AF'
  };

  const radius = 32;
  const strokeWidth = 7.5;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPct = 0;
  const slices = [];
  for (let i = 0; i < moods.length; i++) {
    const m = moods[i];
    const pct = (m.count / total) * 100;
    const strokeLength = (pct / 100) * circumference;
    const strokeOffset = circumference - ((accumulatedPct / 100) * circumference);
    accumulatedPct += pct;
    slices.push({ ...m, strokeLength, strokeOffset, pct, color: colors[m.mood] || '#6B7280' });
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
      <div className="relative h-24 w-24 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible select-none">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F1F1F0" strokeWidth={strokeWidth} />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${slice.strokeLength} ${circumference - slice.strokeLength}`}
              strokeDashoffset={slice.strokeOffset}
              transform="rotate(-90 50 50)"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-black text-foreground">{total.toLocaleString('vi-VN')}</span>
          <span className="text-[7px] font-bold text-muted-foreground uppercase">Check-ins</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 w-full">
        {slices.slice(0, 5).map((slice, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-muted/50 pb-1 last:border-0 last:pb-0 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} /> {slice.mood}
            </span>
            <span className="font-extrabold text-foreground">{slice.count.toLocaleString('vi-VN')} ({slice.pct.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
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

  // Edit Landing Page Stats State
  const [editDownloads, setEditDownloads] = useState('')
  const [editRating, setEditRating] = useState('')
  const [editConnections, setEditConnections] = useState('')
  const [editPeace, setEditPeace] = useState('')
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)

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

  // Sync edit states when localStatsData loads
  useEffect(() => {
    if (localStatsData) {
      setEditDownloads(localStatsData.downloads ?? '')
      setEditRating(localStatsData.rating ?? '')
      setEditConnections(localStatsData.connections ?? '')
      setEditPeace(localStatsData.peacePercentage ?? '')
    }
  }, [localStatsData])

  const handleUpdateLandingStats = async (e) => {
    e.preventDefault()
    setIsUpdatingStats(true)
    try {
      const res = await api.post('/admin/landing-stats', {
        downloads: Number(editDownloads),
        rating: Number(editRating),
        connections: Number(editConnections),
        peacePercentage: Number(editPeace),
      })
      if (res.data?.success) {
        toast.success('Cập nhật chỉ số Landing Page thành công!')
        queryClient.invalidateQueries({ queryKey: ['admin', 'localStats'] })
      } else {
        throw new Error(res.data?.error || 'Lỗi từ server')
      }
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật chỉ số Landing Page')
    } finally {
      setIsUpdatingStats(false)
    }
  }

  // Fetch Reports
  const { data: reportsData, isLoading: isReportsLoading } = useQuery({
    queryKey: ['admin', 'reports', 'recent'],
    queryFn: fetchRecentReports,
    refetchInterval: 60_000,
  })

  // Fetch Reviews for real stats average rating calculation
  const { data: reviewsData } = useQuery({
    queryKey: ['admin', 'reviews', 'for-dashboard-stats'],
    queryFn: () => unwrap(api.get('/admin/reviews')),
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

  const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || [])
  const realAvgRating = reviewsList.length
    ? Number((reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1))
    : 4.8

  const realDownloads = s.users?.total ?? 135
  const realConnections = analyticsData?.summary?.successMatches ?? 1200000
  const realPeace = analyticsData?.moodShare?.find(m => m.mood?.includes('Bình yên'))?.percentage ?? 92

  const handleApplyRealStats = () => {
    setEditDownloads(realDownloads)
    setEditRating(realAvgRating)
    setEditConnections(realConnections)
    setEditPeace(realPeace)
    toast.success('Đã áp dụng số liệu thực tế từ hệ thống!')
  }

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
        <div className="border-b border-[#E8E3DD] pb-1">
          <TabsList className="bg-zinc-100/80 border border-[#E8E3DD] p-1 rounded-xl inline-flex gap-1">
            <TabsTrigger
              value="overview"
              className="rounded-lg px-5 py-2 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
            >
              <LayoutDashboard className="h-4 w-4" />
              Tổng quan chung
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg px-5 py-2 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
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

              {/* Landing Page Stats Config Card */}
              <Card className="border-muted/70 bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-muted/50 p-5 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <SlidersHorizontal className="h-4.5 w-4.5 text-[#FF5A36]" />
                    Cấu hình chỉ số Landing
                  </CardTitle>
                  <button
                    type="button"
                    onClick={handleApplyRealStats}
                    className="text-[10px] text-[#FF5A36] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-0"
                    title="Điền các số liệu thực tế được tính toán tự động từ hệ thống"
                  >
                    Lấy số liệu thật
                  </button>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleUpdateLandingStats} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="stats-downloads" className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                        <span>Lượt tải ứng dụng</span>
                        <span className="text-[10px] text-[#FF5A36] lowercase font-semibold">Thực tế: {realDownloads}</span>
                      </Label>
                      <Input
                        id="stats-downloads"
                        type="number"
                        required
                        value={editDownloads}
                        onChange={(e) => setEditDownloads(e.target.value)}
                        placeholder="Ví dụ: 135"
                        className="h-9 text-xs rounded-xl border-[#E8E3DD] focus-visible:ring-[#FF5A36]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stats-rating" className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                        <span>Đánh giá cộng đồng</span>
                        <span className="text-[10px] text-[#FF5A36] lowercase font-semibold">Thực tế: {realAvgRating}★</span>
                      </Label>
                      <Input
                        id="stats-rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        required
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                        placeholder="Ví dụ: 4.8"
                        className="h-9 text-xs rounded-xl border-[#E8E3DD] focus-visible:ring-[#FF5A36]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stats-connections" className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                        <span>Kết nối thấu cảm</span>
                        <span className="text-[10px] text-[#FF5A36] lowercase font-semibold">Thực tế: {realConnections.toLocaleString('vi-VN')}</span>
                      </Label>
                      <Input
                        id="stats-connections"
                        type="number"
                        required
                        value={editConnections}
                        onChange={(e) => setEditConnections(e.target.value)}
                        placeholder="Ví dụ: 1200000"
                        className="h-9 text-xs rounded-xl border-[#E8E3DD] focus-visible:ring-[#FF5A36]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stats-peace" className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                        <span>Cảm thấy bình yên (%)</span>
                        <span className="text-[10px] text-[#FF5A36] lowercase font-semibold">Thực tế: {realPeace}%</span>
                      </Label>
                      <Input
                        id="stats-peace"
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={editPeace}
                        onChange={(e) => setEditPeace(e.target.value)}
                        placeholder="Ví dụ: 92"
                        className="h-9 text-xs rounded-xl border-[#E8E3DD] focus-visible:ring-[#FF5A36]"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="w-full h-9 rounded-xl font-bold text-xs active:scale-[0.98] transition-all cursor-pointer" 
                      disabled={isUpdatingStats}
                    >
                      {isUpdatingStats ? 'Đang cập nhật...' : 'Cập nhật chỉ số'}
                    </Button>
                  </form>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E3DD] shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#FF5A36]" />
                Phạm vi thống kê báo cáo
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Lọc dữ liệu báo cáo hệ thống theo các mốc thời gian khác nhau</p>
            </div>
            
            <div className="flex bg-zinc-100 p-1 rounded-xl w-fit border border-[#E8E3DD] self-start sm:self-auto">
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
                      ? 'bg-white text-zinc-900 shadow-sm border border-[#E8E3DD]'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="connection" className="space-y-6">
            <div className="border-b border-[#E8E3DD] pb-1">
              <TabsList className="bg-zinc-100/80 border border-[#E8E3DD] p-1 rounded-xl inline-flex gap-1">
                <TabsTrigger
                  value="connection"
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <TrendingUp className="h-4 w-4" />
                  Kết nối & Trò chuyện
                </TabsTrigger>
                <TabsTrigger
                  value="relationship"
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <Heart className="h-4 w-4" />
                  Cặp đôi & Gắn kết
                </TabsTrigger>
                <TabsTrigger
                  value="ai-healing"
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <Activity className="h-4 w-4" />
                  AI & Chữa lành
                </TabsTrigger>
                <TabsTrigger
                  value="demographics"
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <Users className="h-4 w-4" />
                  Nhân khẩu học
                </TabsTrigger>
                <TabsTrigger
                  value="growth"
                  className="rounded-lg px-4 py-1.5 text-xs font-bold text-zinc-500 data-[state=active]:!bg-white data-[state=active]:!text-[#FF5A36] data-[state=active]:shadow-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer border border-transparent data-[state=active]:border-[#E8E3DD]"
                >
                  <FileBarChart className="h-4 w-4" />
                  Doanh thu & Tăng trưởng
                </TabsTrigger>
              </TabsList>
            </div>

            {isAnalyticsLoading ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground animate-pulse">
                Đang tải dữ liệu thống kê...
              </div>
            ) : (
              <>
                {/* SUB-TAB 1: KẾT NỐI & TRÒ CHUYỆN */}
                <TabsContent value="connection" className="space-y-6 mt-0 outline-none">
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Matching Chart */}
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
                        <Badge className="text-[10px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/10 shadow-none px-2.5 py-0.5 rounded-full">
                          Thành công: {analyticsData?.summary?.successRate ?? 0}%
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

                    {/* Like/Pass & KPIs */}
                    <div className="space-y-6">
                      <Card className="border-muted/70 bg-card overflow-hidden">
                        <CardHeader className="border-b border-muted/50 pb-4 p-5">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="h-4.5 w-4.5 text-[#FF5A36]" />
                            Tỷ lệ Thích / Bỏ qua (Swipe)
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Cơ cấu hành vi vuốt hồ sơ của người dùng
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                          <SwipeRatioChart
                            likes={analyticsData?.summary?.likesCount ?? 0}
                            passes={analyticsData?.summary?.passesCount ?? 0}
                          />
                        </CardContent>
                      </Card>

                      <div className="grid gap-4 grid-cols-2">
                        <Card className="border-muted/70 bg-card p-4 space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chuyển đổi Chat</p>
                          <p className="text-2xl font-black text-foreground">{analyticsData?.summary?.chatConversionRate ?? 0}%</p>
                          <p className="text-[9px] text-muted-foreground">Match nhắn tin</p>
                        </Card>
                        <Card className="border-muted/70 bg-card p-4 space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phản hồi đầu</p>
                          <p className="text-2xl font-black text-foreground">{analyticsData?.summary?.responseLatencyMinutes ?? 0}m</p>
                          <p className="text-[9px] text-muted-foreground">Thời gian chờ TB</p>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Messaging Details row */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Message type share */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Cơ cấu loại tin nhắn gửi đi</CardTitle>
                        <CardDescription className="text-[11px]">Tỷ lệ tin nhắn theo định dạng</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <MessageTypeChart types={analyticsData?.messaging?.types || []} />
                      </CardContent>
                    </Card>

                    {/* Top reactions */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Top Emoji phản ứng nhiều nhất</CardTitle>
                        <CardDescription className="text-[11px]">Các emoji được dùng để thả cảm xúc tin nhắn</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          {(analyticsData?.messaging?.topReactions || []).map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0">
                              <span className="text-lg flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-semibold">#{idx+1}</span>
                                {r.emoji}
                              </span>
                              <span className="text-xs font-black text-foreground">
                                {r.count.toLocaleString('vi-VN')} lượt dùng
                              </span>
                            </div>
                          ))}
                          {(!analyticsData?.messaging?.topReactions || analyticsData?.messaging?.topReactions.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu phản ứng</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Voice details */}
                    <Card className="border-muted/70 bg-card overflow-hidden flex flex-col justify-between">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Tin nhắn thoại (Voice Message)</CardTitle>
                        <CardDescription className="text-[11px]">Hành vi sử dụng tin nhắn âm thanh</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 flex-1 flex flex-col justify-center items-center text-center space-y-2">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                          <Headphones className="h-8 w-8" />
                        </div>
                        <p className="text-2xl font-black text-foreground">
                          {analyticsData?.messaging?.avgVoiceDurationSeconds ?? 0} giây
                        </p>
                        <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
                          Thời lượng trung bình của một tin nhắn thoại được gửi đi trên hệ thống
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* SUB-TAB 2: CẶP ĐÔI & GẮN KẾT */}
                <TabsContent value="relationship" className="space-y-6 mt-0 outline-none">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Relationship Donut Chart */}
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

                    {/* Couple Check-in moods */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Activity className="h-4.5 w-4.5 text-[#FF5A36]" />
                          Cảm xúc khi Check-in cặp đôi
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Tâm trạng chung ghi nhận từ hoạt động check-in đôi
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <CoupleMoodDonutChart moods={analyticsData?.relationshipDetails?.moods || []} />
                      </CardContent>
                    </Card>

                    {/* Daily Action Challenge */}
                    <Card className="border-muted/70 bg-card overflow-hidden flex flex-col justify-between">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Thử thách Daily Action</CardTitle>
                        <CardDescription className="text-xs">Mức độ tương tác thử thách hàng ngày của cặp đôi</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 flex-1 flex flex-col justify-center items-center text-center space-y-2">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <p className="text-2xl font-black text-foreground">
                          {analyticsData?.relationshipDetails?.dailyActionCompletionRate ?? 0}%
                        </p>
                        <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
                          Tỷ lệ hoàn thành các thử thách gắn kết hàng ngày được hệ thống đề xuất
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Streak details row */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Average Streak */}
                    <Card className="border-muted/70 bg-card overflow-hidden flex flex-col justify-between md:col-span-1">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Heart className="h-4.5 w-4.5 text-rose-500" />
                          Chuỗi ngày kết đôi trung bình
                        </CardTitle>
                        <CardDescription className="text-xs">Độ bền vững gắn kết của các cặp đôi hoạt động</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 flex-1 flex flex-col justify-center items-center text-center space-y-2 py-8">
                        <div className="h-14 w-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1">
                          <Heart className="h-7 w-7" />
                        </div>
                        <p className="text-3xl font-black text-foreground">
                          {analyticsData?.relationshipDetails?.avgStreakDays ?? 0} ngày
                        </p>
                        <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
                          Số ngày liên tục (Streak) trung bình mà các cặp đôi duy trì tương tác hàng ngày
                        </p>
                      </CardContent>
                    </Card>

                    {/* Top streaks */}
                    <Card className="border-muted/70 bg-card overflow-hidden md:col-span-2">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Top 5 Cặp đôi có chuỗi ngày (Streak) cao nhất</CardTitle>
                        <CardDescription className="text-xs">Bảng xếp hạng độ gắn kết kỷ lục trên hệ thống</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3.5">
                          {(analyticsData?.relationshipDetails?.topStreaks || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-muted-foreground bg-zinc-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-foreground">{item.names}</span>
                              </div>
                              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-100">
                                🔥 {item.streakDays} ngày
                              </span>
                            </div>
                          ))}
                          {(!analyticsData?.relationshipDetails?.topStreaks || analyticsData?.relationshipDetails?.topStreaks.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-6">Chưa có dữ liệu cặp đôi hoạt động</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* SUB-TAB 3: AI & CHỮA LÀNH */}
                <TabsContent value="ai-healing" className="space-y-6 mt-0 outline-none">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Mood logs */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Activity className="h-4.5 w-4.5 text-[#FF5A36]" />
                          Phân bố cảm xúc (Mood Share)
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Tỷ lệ trạng thái tâm lý người dùng ghi nhận qua nhật ký cảm xúc
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3.5">
                          {(analyticsData?.moodShare || []).slice(0, 4).map((m, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground">{m.mood}</span>
                                <span className="font-extrabold text-foreground">{m.count} lượt ({m.percentage}%)</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden relative">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#FF5A36] to-[#EA2A5A]"
                                  style={{ width: `${m.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          {(!analyticsData?.moodShare || analyticsData?.moodShare.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-6">Chưa có dữ liệu cảm xúc ghi nhận</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Coach Tones */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Activity className="h-4.5 w-4.5 text-[#8B4AFF]" />
                          Tần suất tông giọng AI
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Tông giọng được lựa chọn nhiều nhất trong các phiên tư vấn
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3.5">
                          {(analyticsData?.aiCoachTones || []).slice(0, 4).map((t, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground">{t.tone}</span>
                                <span className="font-extrabold text-foreground">{t.count} lượt ({t.percentage}%)</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden relative">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#8B4AFF] to-[#B975FF]"
                                  style={{ width: `${t.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          {(!analyticsData?.aiCoachTones || analyticsData?.aiCoachTones.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-6">Chưa có dữ liệu tông giọng AI</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Suggestion adoption */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Activity className="h-4.5 w-4.5 text-[#8B4AFF]" />
                          Áp dụng gợi ý AI
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Mức độ hữu ích của tin nhắn đề xuất từ AI Coach
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <AISuggestionAdoptionRing adoptionRate={analyticsData?.summary?.aiAdoptionRate ?? 0} />
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Performance details & Healing Assessment Row */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* AI Coach Performance metrics */}
                    <Card className="border-muted/70 bg-card overflow-hidden md:col-span-1">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Hiệu năng & Chi phí AI</CardTitle>
                        <CardDescription className="text-xs">Chỉ số phản hồi & tài nguyên AI Coach</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-muted/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Tốc độ phản hồi:</span>
                          <span className="font-extrabold text-foreground">{analyticsData?.aiPerformance?.avgLatencySeconds ?? 0}s</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-muted/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Đánh giá trung bình:</span>
                          <span className="font-extrabold text-amber-500">⭐️ {analyticsData?.aiPerformance?.avgRating ?? 0}/5.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-muted-foreground">Tổng Token tiêu hao:</span>
                          <span className="font-extrabold text-foreground">{(analyticsData?.aiPerformance?.totalTokensUsed ?? 0).toLocaleString('vi-VN')}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Model shares */}
                    <Card className="border-muted/70 bg-card overflow-hidden md:col-span-1">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Mô hình AI sử dụng</CardTitle>
                        <CardDescription className="text-xs">Tỷ lệ phân bố các LLMs nền tảng</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 text-xs space-y-3">
                        {(analyticsData?.aiPerformance?.models || []).map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0">
                            <span className="font-bold text-foreground">{m.model}</span>
                            <span className="font-extrabold text-muted-foreground">{m.count.toLocaleString('vi-VN')} phiên</span>
                          </div>
                        ))}
                        {(!analyticsData?.aiPerformance?.models || analyticsData?.aiPerformance?.models.length === 0) && (
                          <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu mô hình</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Healing Assessment recovery intensity */}
                    <Card className="border-muted/70 bg-card overflow-hidden md:col-span-1">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Activity className="h-4.5 w-4.5 text-[#FF5A36]" />
                          Kết quả Đánh giá Chữa lành
                        </CardTitle>
                        <CardDescription className="text-xs">Chỉ số sức khỏe tinh thần tổng hợp</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-muted/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Hoàn thành lộ trình:</span>
                          <span className="font-extrabold text-emerald-600">{analyticsData?.summary?.courseCompletionRate ?? 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-muted-foreground">Cường độ hồi phục TB:</span>
                          <span className="font-extrabold text-foreground">{analyticsData?.healingAssessments?.avgRecoveryIntensity ?? 0}/10.0</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed italic">
                          *Đo lường từ bảng câu hỏi đầu vào và điểm đánh giá định kỳ sau lộ trình
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Triggers and needs row */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Triggers breakdown */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Top Tác nhân kích hoạt cảm xúc (Triggers)</CardTitle>
                        <CardDescription className="text-xs">Yếu tố gây ảnh hưởng tinh thần nhiều nhất được chia sẻ</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          {(analyticsData?.healingAssessments?.triggers || []).map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0 text-xs">
                              <span className="font-bold text-foreground">{t.trigger}</span>
                              <span className="font-extrabold text-muted-foreground">{t.count.toLocaleString('vi-VN')} lượt chọn</span>
                            </div>
                          ))}
                          {(!analyticsData?.healingAssessments?.triggers || analyticsData?.healingAssessments?.triggers.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu trigger</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Needs breakdown */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Top Nhu cầu Chữa lành cấp thiết (Needs)</CardTitle>
                        <CardDescription className="text-xs">Mong muốn được hỗ trợ nhiều nhất của người dùng</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          {(analyticsData?.healingAssessments?.needs || []).map((n, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0 text-xs">
                              <span className="font-bold text-foreground">{n.need}</span>
                              <span className="font-extrabold text-muted-foreground">{n.count.toLocaleString('vi-VN')} lượt chọn</span>
                            </div>
                          ))}
                          {(!analyticsData?.healingAssessments?.needs || analyticsData?.healingAssessments?.needs.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu nhu cầu</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* SUB-TAB 4: NHÂN KHẨU HỌC */}
                <TabsContent value="demographics" className="space-y-6 mt-0 outline-none">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Gender distribution */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Cơ cấu giới tính người dùng</CardTitle>
                        <CardDescription className="text-xs">Phân bố giới tính trên toàn bộ cơ sở hồ sơ</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <GenderRingChart data={analyticsData?.demographics?.gender || []} />
                      </CardContent>
                    </Card>

                    {/* Age distribution */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Phân bố theo nhóm tuổi</CardTitle>
                        <CardDescription className="text-xs">Cơ cấu nhóm tuổi người dùng trong hệ thống</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <AgeVerticalBarChart data={analyticsData?.demographics?.age || []} />
                      </CardContent>
                    </Card>

                    {/* Top cities */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Top 5 Thành phố đông đảo nhất</CardTitle>
                        <CardDescription className="text-xs">Định vị địa lý tập trung người dùng nhiều nhất</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3.5">
                          {(analyticsData?.demographics?.city || []).map((c, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0 text-xs">
                              <span className="font-bold text-foreground">{c.city}</span>
                              <span className="font-extrabold text-muted-foreground">{c.count.toLocaleString('vi-VN')} người dùng</span>
                            </div>
                          ))}
                          {(!analyticsData?.demographics?.city || analyticsData?.demographics?.city.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-6">Chưa có dữ liệu thành phố</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Dating goals distribution */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Phân bố mục tiêu hẹn hò (Dating Goal)</CardTitle>
                        <CardDescription className="text-xs">Định hướng kết đôi mong muốn được người dùng lựa chọn</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          {(analyticsData?.demographics?.datingGoal || []).map((dg, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0 text-xs">
                              <span className="font-bold text-foreground">{dg.goal}</span>
                              <span className="font-extrabold text-muted-foreground">{dg.count.toLocaleString('vi-VN')} hồ sơ</span>
                            </div>
                          ))}
                          {(!analyticsData?.demographics?.datingGoal || analyticsData?.demographics?.datingGoal.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu dating goal</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Zodiac sign distribution */}
                    <Card className="border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <CardTitle className="text-sm font-bold">Phân bố theo Cung Hoàng Đạo phổ biến</CardTitle>
                        <CardDescription className="text-xs">Cung hoàng đạo được khai báo nhiều nhất trên profile</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          {(analyticsData?.demographics?.zodiac || []).slice(0, 5).map((z, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-muted/30 pb-2 last:border-0 last:pb-0 text-xs">
                              <span className="font-bold text-foreground">{z.zodiac}</span>
                              <span className="font-extrabold text-muted-foreground">{z.count.toLocaleString('vi-VN')} người</span>
                            </div>
                          ))}
                          {(!analyticsData?.demographics?.zodiac || analyticsData?.demographics?.zodiac.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu cung hoàng đạo</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* SUB-TAB 5: DOANH THU & TĂNG TRƯỞNG */}
                <TabsContent value="growth" className="space-y-6 mt-0 outline-none">
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Subscriptions structural bar */}
                    <Card className="lg:col-span-2 border-muted/70 bg-card overflow-hidden">
                      <CardHeader className="border-b border-muted/50 pb-4 p-5">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Phân bố gói Premium & Thuê bao
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Cơ cấu các gói thành viên đang sử dụng trong hệ thống
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {/* Summary Rate */}
                        <div className="bg-[#10B981]/5 border border-[#10B981]/10 rounded-2xl p-5 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tỷ lệ chuyển đổi trả phí</p>
                            <p className="text-2xl font-black text-emerald-800">{analyticsData?.summary?.premiumRate ?? 0}%</p>
                          </div>
                          <p className="text-xs text-emerald-700/80 font-medium max-w-[220px] text-right">
                            Phần trăm tài khoản đăng ký sử dụng các gói nâng cấp trả phí PLUS, PREMIUM hoặc ELITE.
                          </p>
                        </div>

                        {/* Structural Bars */}
                        <div className="space-y-4">
                          {[
                            { label: 'Gói FREE (Miễn phí)', value: analyticsData?.summary?.freeSubsCount ?? 0, color: 'bg-zinc-300' },
                            { label: 'Gói PLUS (Nâng cấp nhẹ)', value: analyticsData?.summary?.plusSubsCount ?? 0, color: 'bg-blue-500' },
                            { label: 'Gói PREMIUM (Vừa phải)', value: analyticsData?.summary?.premiumSubsCount ?? 0, color: 'bg-[#FF5A36]' },
                            { label: 'Gói ELITE (Cao cấp nhất)', value: analyticsData?.summary?.eliteSubsCount ?? 0, color: 'bg-purple-600' }
                          ].map((tier, idx) => {
                            const total =
                              (analyticsData?.summary?.freeSubsCount ?? 0) +
                              (analyticsData?.summary?.plusSubsCount ?? 0) +
                              (analyticsData?.summary?.premiumSubsCount ?? 0) +
                              (analyticsData?.summary?.eliteSubsCount ?? 0) || 1;
                            const pct = Math.round((tier.value / total) * 1000) / 10;

                            return (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-foreground">{tier.label}</span>
                                  <span className="text-muted-foreground font-semibold">
                                    {tier.value.toLocaleString('vi-VN')} người ({pct}%)
                                  </span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden relative border border-muted/30">
                                  <div
                                    className={`h-full rounded-full ${tier.color} transition-all duration-1000 ease-out`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Referrals & Promos count */}
                    <div className="space-y-6">
                      <Card className="border-muted/70 bg-card overflow-hidden">
                        <CardHeader className="border-b border-muted/50 pb-4 p-5">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="h-4.5 w-4.5 text-[#FF5A36]" />
                            Mã giới thiệu (Referral Code)
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Hiệu quả lan tỏa cộng đồng qua giới thiệu bạn bè
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-col justify-center items-center text-center py-8">
                          <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 bg-opacity-10 flex items-center justify-center mb-1">
                            <Users className="h-7 w-7 text-emerald-600" />
                          </div>
                          <p className="text-2xl font-black text-foreground">
                            {(analyticsData?.summary?.referralsCount ?? 0).toLocaleString('vi-VN')} lượt
                          </p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            Số tài khoản mới đăng ký thành công qua mã mời từ người dùng cũ
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-muted/70 bg-card overflow-hidden">
                        <CardHeader className="border-b border-muted/50 pb-4 p-5">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="h-4.5 w-4.5 text-[#8B4AFF]" />
                            Mã khuyến mãi (Promo Code)
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Tỷ lệ quy đổi mã giảm giá / khuyến mãi trả phí từ admin
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-col justify-center items-center text-center py-8">
                          <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 bg-opacity-10 flex items-center justify-center mb-1">
                            <ClipboardList className="h-7 w-7 text-indigo-600" />
                          </div>
                          <p className="text-2xl font-black text-foreground">
                            {(analyticsData?.summary?.promosCount ?? 0).toLocaleString('vi-VN')} lượt
                          </p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            Số lượt áp dụng thành công mã khuyến mãi để gia hạn/đổi gói
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
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
