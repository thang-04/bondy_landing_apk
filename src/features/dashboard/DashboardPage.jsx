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
  CREATED: { label: 'Mới tạo', variant: 'destructive', icon: AlertTriangle },
  UNDER_REVIEW: { label: 'Đang xem xét', variant: 'warning', icon: Activity },
  RESOLVED: { label: 'Đã giải quyết', variant: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Đã từ chối', variant: 'muted', icon: XCircle },
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
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Đang tải thông tin tổng quan...
      </div>
    )
  }

  if (isStatsError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive font-medium">
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
      gradient: 'from-orange-500/10 to-coral-500/10',
    },
    {
      label: 'Bộ khảo sát',
      value: s.surveys?.total ?? 0,
      hint: `${s.surveys?.submissionsTotal ?? 0} lượt nộp tổng cộng`,
      icon: ClipboardList,
      gradient: 'from-pink-500/10 to-red-500/10',
    },
    {
      label: 'Lượt khảo sát hôm nay',
      value: s.surveys?.submissionsToday ?? 0,
      hint: 'tính từ 00:00 hôm nay',
      icon: FileBarChart,
      gradient: 'from-purple-500/10 to-indigo-500/10',
    },
  ]

  const healingCards = [
    { label: 'Bài đọc', value: s.healing?.articles ?? 0, icon: BookOpen, color: 'text-orange-500', border: 'border-l-orange-400' },
    { label: 'Audio', value: s.healing?.audios ?? 0, icon: Headphones, color: 'text-pink-500', border: 'border-l-pink-400' },
    { label: 'Bài tập', value: s.healing?.exercises ?? 0, icon: Activity, color: 'text-red-500', border: 'border-l-red-400' },
    { label: 'Lộ trình', value: s.healing?.courses ?? 0, icon: Route, color: 'text-purple-500', border: 'border-l-purple-400' },
  ]

  const openReportDetail = (report) => {
    setSelectedReport(report)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6B6B]/10 via-[#EA2A5A]/10 to-[#9F2AEA]/10 p-6 md:p-8 border border-primary/10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Chào mừng trở lại, <span className="bg-gradient-to-r from-[#FF6B6B] to-[#EA2A5A] bg-clip-text text-transparent">Admin</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Số liệu thống kê toàn bộ hệ thống chữa lành và báo cáo mới nhất. Hệ thống tự động làm mới sau mỗi 60 giây.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_right_bottom,rgba(255,107,107,0.15),transparent)] pointer-events-none" />
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label} className="overflow-hidden hover:shadow-md transition-all duration-300 group border-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{c.label}</CardTitle>
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{c.value.toLocaleString('vi-VN')}</div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                  {c.hint}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Healing Contents Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Nội dung Healing
        </h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {healingCards.map((c) => {
            const Icon = c.icon
            return (
              <Card key={c.label} className={`border-l-4 ${c.border} hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</p>
                    <p className="text-xl font-extrabold">{c.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${c.color} opacity-80`} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Reports and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reports Table (Col span 2) */}
        <Card className="lg:col-span-2 border-muted/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Báo cáo mới nhất cần xử lý
              </CardTitle>
              <CardDescription>
                Báo cáo vi phạm từ người dùng trong hệ thống
              </CardDescription>
            </div>
            {reports.length > 0 && (
              <Badge variant="outline" className="text-xs font-normal border-destructive/20 text-destructive bg-destructive/5">
                Cần kiểm duyệt
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isReportsLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Đang tải báo cáo...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground border-t">
                Không có báo cáo nào chưa xử lý. Hệ thống an toàn!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người báo cáo</TableHead>
                    <TableHead>Người bị tố cáo</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => {
                    const statusVal = r.status || 'CREATED'
                    const config = reportStatusConfig[statusVal] || reportStatusConfig.CREATED
                    const StatusIcon = config.icon

                    return (
                      <TableRow key={r.id} className="hover:bg-muted/10">
                        <TableCell className="font-medium">
                          <div className="text-xs font-bold">{r.reporter?.name || '—'}</div>
                          <div className="text-[10px] text-muted-foreground">{r.reporter?.email || '—'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-bold">{r.targetUser?.name || '—'}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {r.targetUser?.email || '—'}
                            {r.targetUser?.isActive === false && (
                              <Badge variant="destructive" className="py-0 px-1 text-[8px]">Đã khóa</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium max-w-[120px] truncate">
                          {reasonConfig[r.reason] || r.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1 py-0.5 px-2 text-[10px]">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReportDetail(r)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Quick Guide (Col span 1) */}
        <div className="space-y-4">
          <Card className="border-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-primary" />
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild size="sm" variant="outline" className="justify-start gap-2 h-9">
                <Link to="/surveys/new">
                  <PlusCircle className="h-4 w-4 text-primary" />
                  Tạo khảo sát mới
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="justify-start gap-2 h-9">
                <Link to="/healing/articles/new">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  Đăng bài đọc mới
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="justify-start gap-2 h-9">
                <Link to="/healing/audios/new">
                  <Headphones className="h-4 w-4 text-pink-500" />
                  Tải lên audio mới
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="justify-start gap-2 h-9">
                <Link to="/healing/plans/new">
                  <Route className="h-4 w-4 text-purple-500" />
                  Tạo lộ trình chữa lành
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Hướng dẫn nhanh</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 text-muted-foreground">
              <div className="flex gap-2.5 items-start">
                <Badge variant="muted" className="h-5 w-5 p-0 flex items-center justify-center shrink-0">1</Badge>
                <p>Vào <strong>Khảo sát</strong> để quản lý bộ câu hỏi & xác định dải điểm phân loại người dùng.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Badge variant="muted" className="h-5 w-5 p-0 flex items-center justify-center shrink-0">2</Badge>
                <p>Upload nội dung Chữa lành mới trong phần <strong>Bài đọc / Audio / Bài tập</strong>.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Badge variant="muted" className="h-5 w-5 p-0 flex items-center justify-center shrink-0">3</Badge>
                <p>Vào <strong>Lộ trình</strong> để xâu chuỗi bài viết và audio cho người dùng trải nghiệm theo ngày.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Badge variant="muted" className="h-5 w-5 p-0 flex items-center justify-center shrink-0">4</Badge>
                <p>Quản lý người dùng và theo dõi submissions của họ trong tab <strong>Người dùng</strong>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Moderation Dialog */}
      {selectedReport && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Chi tiết báo cáo vi phạm
              </DialogTitle>
              <DialogDescription>
                Xem chi tiết thông tin và xử lý kiểm duyệt báo cáo này
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Lý do:</div>
                <div className="col-span-2 font-medium text-destructive">
                  {reasonConfig[selectedReport.reason] || selectedReport.reason}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Mô tả:</div>
                <div className="col-span-2 text-foreground italic bg-muted/20 p-2 rounded">
                  {selectedReport.description || 'Không có mô tả chi tiết.'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Người báo:</div>
                <div className="col-span-2">
                  <span className="font-bold">{selectedReport.reporter?.name || '—'}</span>{' '}
                  <span className="text-muted-foreground text-xs">({selectedReport.reporter?.email || '—'})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <div className="font-semibold text-muted-foreground">Người bị tố:</div>
                <div className="col-span-2">
                  <span className="font-bold text-red-500">{selectedReport.targetUser?.name || '—'}</span>{' '}
                  <span className="text-muted-foreground text-xs">({selectedReport.targetUser?.email || '—'})</span>
                  <div className="mt-1">
                    Trạng thái: {' '}
                    {selectedReport.targetUser?.isActive === false ? (
                      <Badge variant="destructive" className="py-0 px-1 text-[10px]">Đã bị khóa tài khoản</Badge>
                    ) : (
                      <Badge variant="success" className="py-0 px-1 text-[10px]">Đang hoạt động</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="font-semibold text-muted-foreground">Trạng thái báo cáo:</div>
                <div className="col-span-2">
                  <Badge variant={reportStatusConfig[selectedReport.status]?.variant || 'default'}>
                    {reportStatusConfig[selectedReport.status]?.label || selectedReport.status}
                  </Badge>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-between w-full">
              {/* Ban User option - Destructive action */}
              {selectedReport.targetUser?.isActive !== false && (
                <Button
                  variant="destructive"
                  className="sm:mr-auto"
                  disabled={moderateMutation.isLoading}
                  onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'BAN_USER' })}
                >
                  <ShieldAlert className="h-4 w-4 mr-1.5" />
                  Khóa User này
                </Button>
              )}

              <div className="flex flex-wrap gap-2 justify-end">
                {selectedReport.status === 'CREATED' && (
                  <Button
                    variant="outline"
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
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      disabled={moderateMutation.isLoading}
                      onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'REJECT' })}
                    >
                      Bác bỏ
                    </Button>
                    <Button
                      disabled={moderateMutation.isLoading}
                      onClick={() => moderateMutation.mutate({ id: selectedReport.id, action: 'RESOLVE' })}
                    >
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
