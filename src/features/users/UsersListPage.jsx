import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, Eye, Users, Shield, Sparkles, Zap, Crown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usersApi } from './api'

const genderLabels = {
  MALE: { label: 'Nam', className: 'bg-sky-500/10 text-sky-600 border border-sky-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  FEMALE: { label: 'Nữ', className: 'bg-pink-500/10 text-pink-600 border border-pink-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  OTHER: { label: 'Khác', className: 'bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  NON_BINARY: { label: 'Phi nhị nguyên', className: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
}

const datingGoalLabels = {
  FRIENDSHIP: { label: 'Kết bạn', className: 'bg-teal-500/10 text-teal-600 border border-teal-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  DATING: { label: 'Hẹn hò', className: 'bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  LONG_TERM: { label: 'Lâu dài', className: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  MARRIAGE: { label: 'Hôn nhân', className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  NOT_SURE: { label: 'Chưa rõ', className: 'bg-slate-500/10 text-slate-600 border border-slate-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
}

const subTierLabels = {
  FREE: { label: 'Miễn phí', className: 'bg-gray-500/10 text-gray-600 border border-gray-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  PLUS: { label: 'Plus', className: 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  PREMIUM: { label: 'Premium', className: 'bg-violet-500/10 text-violet-600 border border-violet-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]' },
  ELITE: { label: 'Elite', className: 'bg-amber-500/20 text-amber-700 border border-amber-500/30 shadow-none font-bold rounded-full px-2.5 py-0.5 text-[10px]' },
}

function UserAvatar({ user }) {
  const [error, setError] = useState(false)
  const rawUrl = user.profile?.photos?.[0] || user.image

  const getAvatarUrl = (url) => {
    if (!url) return ''
    const apiUploadsIdx = url.indexOf('/api/uploads/')
    if (apiUploadsIdx !== -1) {
      return '/uploads/' + url.substring(apiUploadsIdx + 13)
    }
    const uploadsIdx = url.indexOf('/uploads/')
    if (uploadsIdx !== -1) {
      return '/uploads/' + url.substring(uploadsIdx + 9)
    }
    return url
  }

  const url = getAvatarUrl(rawUrl)
  const displayName = user.profile?.fullName || user.name || user.email || 'U'
  const initial = displayName.charAt(0).toUpperCase()

  if (url && !error) {
    return (
      <img
        src={url}
        alt={displayName}
        className="h-10 w-10 rounded-full object-cover border border-muted/80 shadow-sm"
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div className="h-10 w-10 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold text-sm border border-violet-500/20 shadow-sm">
      {initial}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

export function UsersListPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [isActive, setIsActive] = useState('all')
  const [gender, setGender] = useState('all')
  const [subscriptionTier, setSubscriptionTier] = useState('all')
  const [page, setPage] = useState(1)
  const limit = 20

  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(role !== 'all' && { role }),
    ...(isActive !== 'all' && { isActive }),
    ...(gender !== 'all' && { gender }),
    ...(subscriptionTier !== 'all' && { subscriptionTier }),
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => usersApi.list(params),
    keepPreviousData: true,
  })

  const users = data?.users || []
  const pagination = data?.pagination || { total: 0, pages: 1 }
  const stats = data?.stats || {
    total: 0,
    gender: { male: 0, female: 0, other: 0 },
    subscription: { free: 0, plus: 0, premium: 0, elite: 0 }
  }

  const kpiCards = [
    {
      label: 'Tổng người dùng',
      value: stats.total,
      hint: `Nam: ${stats.gender.male} • Nữ: ${stats.gender.female} • Khác: ${stats.gender.other}`,
      icon: Users,
      gradient: 'from-[#FF5A36]/8 to-transparent border-t-2 border-t-[#FF5A36]/60',
      iconBg: 'bg-[#FF5A36]/10 text-[#FF5A36]',
    },
    {
      label: 'Gói Miễn phí',
      value: stats.subscription.free,
      hint: 'Người dùng gói cơ bản',
      icon: Shield,
      gradient: 'from-zinc-500/8 to-transparent border-t-2 border-t-zinc-500/60',
      iconBg: 'bg-zinc-500/10 text-zinc-500',
    },
    {
      label: 'Gói Plus',
      value: stats.subscription.plus,
      hint: 'Tính năng bổ sung',
      icon: Sparkles,
      gradient: 'from-cyan-500/8 to-transparent border-t-2 border-t-cyan-500/60',
      iconBg: 'bg-cyan-500/10 text-cyan-600',
    },
    {
      label: 'Gói Premium',
      value: stats.subscription.premium,
      hint: 'Trải nghiệm đầy đủ',
      icon: Zap,
      gradient: 'from-violet-500/8 to-transparent border-t-2 border-t-violet-500/60',
      iconBg: 'bg-violet-500/10 text-violet-600',
    },
    {
      label: 'Gói Elite',
      value: stats.subscription.elite,
      hint: 'Đặc quyền cao cấp nhất',
      icon: Crown,
      gradient: 'from-amber-500/8 to-transparent border-t-2 border-t-amber-500/60',
      iconBg: 'bg-amber-500/10 text-amber-600',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Người dùng</h1>
          <p className="text-xs text-muted-foreground">
            Quản lý tài khoản, phân quyền và trạng thái hoạt động trong hệ thống
          </p>
        </div>
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

      <Card className="p-5 border-muted/70 bg-card rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo email, tên..."
              className="pl-9 rounded-xl border-muted/80 bg-background/50 hover:bg-background transition-colors h-10 text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] rounded-xl border-muted/80 h-10 text-sm"><SelectValue placeholder="Vai trò" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="MODERATOR">MODERATOR</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isActive} onValueChange={(v) => { setIsActive(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] rounded-xl border-muted/80 h-10 text-sm"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Bị khoá</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gender} onValueChange={(v) => { setGender(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] rounded-xl border-muted/80 h-10 text-sm"><SelectValue placeholder="Giới tính" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả giới tính</SelectItem>
              <SelectItem value="MALE">Nam</SelectItem>
              <SelectItem value="FEMALE">Nữ</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
              <SelectItem value="UNKNOWN">Chưa cập nhật</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subscriptionTier} onValueChange={(v) => { setSubscriptionTier(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] rounded-xl border-muted/80 h-10 text-sm"><SelectValue placeholder="Gói đăng ký" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả gói</SelectItem>
              <SelectItem value="FREE">Miễn phí</SelectItem>
              <SelectItem value="PLUS">Gói Plus</SelectItem>
              <SelectItem value="PREMIUM">Gói Premium</SelectItem>
              <SelectItem value="ELITE">Gói Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-muted/70 bg-card rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Đang tải người dùng...</div>
        ) : isError ? (
          <div className="p-12 text-center text-sm text-destructive font-medium bg-destructive/5">
            {error?.message || 'Lỗi tải dữ liệu người dùng.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Người dùng</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Giới tính</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Gói</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Mục tiêu</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Vai trò</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Trạng thái</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3 text-center">Surveys nộp</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Tạo lúc</TableHead>
                    <TableHead className="w-20 py-3" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-12">
                        Không tìm thấy người dùng nào phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                  {users.map((u) => {
                    let rClass = "bg-muted text-muted-foreground/80 border-none shadow-none font-bold text-[9px] rounded-full px-2 py-0.5";
                    if (u.role === 'ADMIN') rClass = "bg-[#FF5A36]/10 text-[#FF5A36] border-none shadow-none font-bold text-[9px] rounded-full px-2 py-0.5";
                    else if (u.role === 'MODERATOR') rClass = "bg-[#8B4AFF]/10 text-[#8B4AFF] border-none shadow-none font-bold text-[9px] rounded-full px-2 py-0.5";

                    return (
                      <TableRow key={u.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={u} />
                            <div className="space-y-0.5">
                              <p className="font-bold text-sm text-foreground leading-tight">
                                {u.profile?.fullName || u.name || '—'}
                              </p>
                              <p className="text-xs text-muted-foreground font-medium">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {u.profile?.gender ? (
                            <Badge className={genderLabels[u.profile.gender]?.className || 'bg-gray-500/10 text-gray-600 border border-gray-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]'}>
                              {genderLabels[u.profile.gender]?.label || u.profile.gender}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/10 text-gray-400 border border-gray-500/10 shadow-none font-medium rounded-full px-2.5 py-0.5 text-[10px]">
                              Chưa cập nhật
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge className={subTierLabels[u.subscriptionTier]?.className || subTierLabels.FREE.className}>
                            {subTierLabels[u.subscriptionTier]?.label || 'Miễn phí'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {u.profile?.datingGoal ? (
                            <Badge className={datingGoalLabels[u.profile.datingGoal]?.className || 'bg-gray-500/10 text-gray-600 border border-gray-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]'}>
                              {datingGoalLabels[u.profile.datingGoal]?.label || u.profile.datingGoal}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/10 text-gray-400 border border-gray-500/10 shadow-none font-medium rounded-full px-2.5 py-0.5 text-[10px]">
                              Chưa cập nhật
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge className={rClass}>{u.role}</Badge>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {u.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]">
                              Khoá
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3.5 text-xs font-bold text-foreground">
                          {u._count?.UserSurveySubmission ?? 0}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground/80 py-3.5">
                          {formatDate(u.createdAt)}
                        </TableCell>
                        <TableCell className="py-3.5 text-center">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                            <Link to={`/users/${u.id}`}>
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-[#8B4AFF]" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-muted/50 bg-muted/5">
              <div className="text-xs text-muted-foreground">
                Tổng cộng <span className="font-semibold text-foreground">{pagination.total}</span> người dùng — Trang {page}/{pagination.pages || 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full text-xs h-8 px-3 transition-colors"
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (pagination.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full text-xs h-8 px-3 transition-colors"
                >
                  Sau <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
