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

  // Fetch Stats
  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError, error: statsError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  // Fetch Local APK & Visit Stats
  const { data: localStatsData } = useQuery({
    queryKey: ['admin', 'localStats'],
    queryFn: async () => {
      const res = await fetch('/api/local-stats')
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
