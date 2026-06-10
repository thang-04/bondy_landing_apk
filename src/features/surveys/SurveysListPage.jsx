import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { surveysApi } from './api'

const statusVariant = {
  draft: 'warning',
  active: 'success',
  archived: 'muted',
}

export function SurveysListPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const limit = 20

  const params = { page, limit, ...(search && { search }) }
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'surveys', params],
    queryFn: () => surveysApi.list(params),
    keepPreviousData: true,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => surveysApi.remove(id),
    onSuccess: () => {
      toast.success('Đã xoá')
      qc.invalidateQueries({ queryKey: ['admin', 'surveys'] })
      setDeleteId(null)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  const surveys = data?.surveys || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Khảo sát</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các bộ khảo sát onboarding / personality / wellbeing
          </p>
        </div>
        <Button asChild>
          <Link to="/surveys/new">
            <Plus className="mr-2 h-4 w-4" /> Tạo khảo sát
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm theo code, tiêu đề..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-center">Câu hỏi</TableHead>
                  <TableHead className="text-center">Submissions</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      Chưa có khảo sát nào.
                    </TableCell>
                  </TableRow>
                )}
                {surveys.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.surveyTemplate?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.surveyTemplate?.surveyType}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{s._count?.mappings ?? 0}</TableCell>
                    <TableCell className="text-center">{s._count?.submissions ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[s.status] || 'muted'}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/surveys/${s.id}/submissions`} title="Submissions">
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/surveys/${s.id}`} title="Sửa">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(s.id)}
                        title="Xoá"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
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

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá khảo sát?</DialogTitle>
            <DialogDescription>
              Hành động này không thể khôi phục. Toàn bộ submission liên kết sẽ bị xoá theo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Huỷ</Button>
            <Button
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(deleteId)}
            >
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
