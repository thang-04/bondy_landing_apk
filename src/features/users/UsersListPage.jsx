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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài khoản và phân quyền
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo email, tên..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Vai trò" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="MODERATOR">MODERATOR</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isActive} onValueChange={(v) => { setIsActive(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Bị khoá</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            {error?.message || 'Lỗi tải dữ liệu'}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Surveys</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                      Không tìm thấy người dùng nào.
                    </TableCell>
                  </TableRow>
                )}
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>{u.profile?.fullName || u.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[u.role] || 'muted'}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="success">Hoạt động</Badge>
                      ) : (
                        <Badge variant="destructive">Khoá</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {u._count?.UserSurveySubmission ?? 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/users/${u.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Tổng <span className="font-medium text-foreground">{pagination.total}</span> người dùng — Trang {page}/{pagination.pages || 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (pagination.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
