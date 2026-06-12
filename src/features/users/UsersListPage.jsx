import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
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

const roleVariant = {
  ADMIN: 'default',
  MODERATOR: 'secondary',
  USER: 'muted',
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
  const [page, setPage] = useState(1)
  const limit = 20

  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(role !== 'all' && { role }),
    ...(isActive !== 'all' && { isActive }),
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => usersApi.list(params),
    keepPreviousData: true,
  })

  const users = data?.users || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

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
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Email</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Tên hiển thị</TableHead>
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
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
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
                        <TableCell className="font-semibold text-xs text-foreground py-3.5">{u.email}</TableCell>
                        <TableCell className="text-xs text-foreground py-3.5">{u.profile?.fullName || u.name || '—'}</TableCell>
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
