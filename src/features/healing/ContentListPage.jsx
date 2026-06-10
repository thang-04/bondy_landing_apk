import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

/**
 * Generic list page for HealingContent of a given type. Pass:
 *  - title, basePath ("/healing/articles")
 *  - api: { list, remove }
 *  - extraColumns: [{ header, render(row) }]
 */
export function ContentListPage({ title, description, basePath, api, queryKey, extraColumns = [] }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [published, setPublished] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const limit = 20

  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(published !== 'all' && { isPublished: published }),
  }
  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => api.list(params),
    keepPreviousData: true,
  })

  const removeMutation = useMutation({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => {
      toast.success('Đã xoá')
      qc.invalidateQueries({ queryKey })
      setDeleteId(null)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  const items = data?.items || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button asChild>
          <Link to={`${basePath}/new`}>
            <Plus className="mr-2 h-4 w-4" /> Tạo mới
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={published} onValueChange={(v) => { setPublished(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>
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
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  {extraColumns.map((c) => (
                    <TableHead key={c.header} className={c.className}>{c.header}</TableHead>
                  ))}
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5 + extraColumns.length} className="text-center text-sm text-muted-foreground py-8">
                      Chưa có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{row.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(row.tags || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="muted">{t}</Badge>
                        ))}
                        {(row.tags || []).length > 3 && (
                          <Badge variant="muted">+{row.tags.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    {extraColumns.map((c) => (
                      <TableCell key={c.header} className={c.className}>{c.render(row)}</TableCell>
                    ))}
                    <TableCell>
                      {row.isPublished ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`${basePath}/${row.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
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
            <DialogTitle>Xoá nội dung này?</DialogTitle>
            <DialogDescription>
              Hành động không thể khôi phục. Các tham chiếu (lesson, ritual link…) sẽ thành null.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Huỷ</Button>
            <Button variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(deleteId)}>
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
