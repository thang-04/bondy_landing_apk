import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usersApi } from './api'
import { useAuth } from '@/features/auth/useAuth'

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

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN')
  } catch {
    return iso
  }
}

function UserAvatar({ user }) {
  const [error, setError] = useState(false)
  const rawUrl = user.profile?.photos?.[0] || user.image

  const getAvatarUrl = (url) => {
    if (!url) return ''
    return url
      .replace(/https?:\/\/103\.149\.86\.25:?\d*\/api\/uploads\//g, '/uploads/')
      .replace(/https?:\/\/103\.149\.86\.25:?\d*\/uploads\//g, '/uploads/')
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

export function UserDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { user: me } = useAuth()
  const isSelf = me?.id === id

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  })

  const [draftRole, setDraftRole] = useState(null)
  const [draftActive, setDraftActive] = useState(null)

  const mutation = useMutation({
    mutationFn: (payload) => usersApi.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật người dùng')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setDraftRole(null)
      setDraftActive(null)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message || 'Cập nhật thất bại'),
  })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>
  }
  if (isError) {
    return <div className="text-sm text-destructive">{error?.message || 'Lỗi'}</div>
  }
  if (!data) return null

  const currentRole = draftRole ?? data.role
  const currentActive = draftActive ?? data.isActive
  const dirty = currentRole !== data.role || currentActive !== data.isActive
  const isAdminMe = me?.role === 'ADMIN'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/users"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <UserAvatar user={data} />
          <div>
            <h1 className="text-2xl font-semibold">{data.profile?.fullName || data.name || data.email}</h1>
            <p className="text-sm text-muted-foreground">{data.email}</p>
          </div>
        </div>
        <Button
          disabled={!dirty || mutation.isPending}
          onClick={() =>
            mutation.mutate({
              ...(currentRole !== data.role && { role: currentRole }),
              ...(currentActive !== data.isActive && { isActive: currentActive }),
            })
          }
        >
          <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="permissions">Quyền</TabsTrigger>
          <TabsTrigger value="submissions">
            Khảo sát ({data.submissions?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
              <Field label="User ID" value={data.id} mono />
              <Field label="Email" value={data.email} />
              <Field label="Tên" value={data.profile?.fullName || data.name || '—'} />
              <Field
                label="Email verified"
                value={data.emailVerified ? formatDateTime(data.emailVerified) : 'Chưa xác thực'}
              />
              <Field
                label="Giới tính"
                value={
                  data.profile?.gender ? (
                    <Badge className={genderLabels[data.profile.gender]?.className || 'bg-gray-500/10 text-gray-600 border border-gray-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]'}>
                      {genderLabels[data.profile.gender]?.label || data.profile.gender}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/10 text-gray-400 border border-gray-500/10 shadow-none font-medium rounded-full px-2.5 py-0.5 text-[10px]">
                      Chưa cập nhật
                    </Badge>
                  )
                }
              />
              <Field
                label="Gói đăng ký hiện tại"
                value={
                  <Badge className={subTierLabels[data.subscriptionTier]?.className || subTierLabels.FREE.className}>
                    {subTierLabels[data.subscriptionTier]?.label || 'Miễn phí'}
                  </Badge>
                }
              />
              <Field
                label="Mục tiêu tìm kiếm"
                value={
                  data.profile?.datingGoal ? (
                    <Badge className={datingGoalLabels[data.profile.datingGoal]?.className || 'bg-gray-500/10 text-gray-600 border border-gray-500/20 shadow-none font-semibold rounded-full px-2.5 py-0.5 text-[10px]'}>
                      {datingGoalLabels[data.profile.datingGoal]?.label || data.profile.datingGoal}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/10 text-gray-400 border border-gray-500/10 shadow-none font-medium rounded-full px-2.5 py-0.5 text-[10px]">
                      Chưa cập nhật
                    </Badge>
                  )
                }
              />
              <Field label="Trust score" value={`${data.trustScore ?? 100} / 100`} />
              <Field label="Lần online gần nhất" value={formatDateTime(data.lastSeenAt)} />
              <Field label="Tạo lúc" value={formatDateTime(data.createdAt)} />
              <Field label="Cập nhật lúc" value={formatDateTime(data.updatedAt)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader><CardTitle>Quyền truy cập</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select
                  value={currentRole}
                  onValueChange={setDraftRole}
                  disabled={!isAdminMe}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                {!isAdminMe && (
                  <p className="text-xs text-muted-foreground">Chỉ ADMIN mới được đổi vai trò.</p>
                )}
                {isSelf && (
                  <p className="text-xs text-amber-600">
                    Bạn đang xem chính mình — không thể tự hạ quyền.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Trạng thái tài khoản</Label>
                <Select
                  value={String(currentActive)}
                  onValueChange={(v) => setDraftActive(v === 'true')}
                  disabled={!isAdminMe}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Khoá tài khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử khảo sát</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khảo sát</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Điểm</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Bắt đầu</TableHead>
                    <TableHead>Hoàn thành</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.submissions || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        Người dùng chưa làm khảo sát nào.
                      </TableCell>
                    </TableRow>
                  )}
                  {(data.submissions || []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.survey?.title || s.surveyId}</div>
                        <div className="text-xs text-muted-foreground">{s.survey?.code}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'submitted' || s.submittedAt ? 'success' : 'warning'}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{s.totalScore ?? '—'}</TableCell>
                      <TableCell>
                        {s.finalModeLabel ? (
                          <div>
                            <div className="font-medium">{s.finalModeLabel}</div>
                            <div className="text-xs text-muted-foreground">{s.finalModeCode}</div>
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(s.startedAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(s.submittedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={mono ? 'font-mono text-xs mt-1' : 'mt-1'}>{value}</div>
    </div>
  )
}
