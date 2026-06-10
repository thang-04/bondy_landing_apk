import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { surveysApi } from './api'

function dt(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('vi-VN') } catch { return iso }
}

export function SurveySubmissionsPage() {
  const { id } = useParams()
  const [page, setPage] = useState(1)
  const limit = 20

  const { data: survey } = useQuery({
    queryKey: ['admin', 'surveys', id],
    queryFn: () => surveysApi.get(id),
  })
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'surveys', id, 'submissions', page],
    queryFn: () => surveysApi.submissions(id, { page, limit }),
    keepPreviousData: true,
  })

  const subs = data?.submissions || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/surveys"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Submissions</h1>
          <p className="text-sm text-muted-foreground">{survey?.title}</p>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Điểm</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Bắt đầu</TableHead>
                  <TableHead>Hoàn thành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      Chưa có submission nào.
                    </TableCell>
                  </TableRow>
                )}
                {subs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link to={`/users/${s.user?.id}`} className="font-medium hover:underline">
                        {s.user?.email}
                      </Link>
                      <div className="text-xs text-muted-foreground">{s.user?.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.submittedAt ? 'success' : 'warning'}>{s.status}</Badge>
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
                    <TableCell className="text-sm text-muted-foreground">{dt(s.startedAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dt(s.submittedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Tổng {pagination.total} — Trang {page}/{pagination.pages || 1}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4" /> Trước
                </Button>
                <Button variant="outline" size="sm" disabled={page >= (pagination.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}>
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
