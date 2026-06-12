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
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Button asChild className="rounded-full bg-[#FF5A36] hover:bg-[#E04F2E] text-white shadow-sm shadow-primary/20 transition-all duration-300 font-semibold h-9 px-4">
          <Link to={`${basePath}/new`}>
            <Plus className="mr-1.5 h-4 w-4" /> Tạo mới
          </Link>
        </Button>
      </div>

      <Card className="p-5 border-muted/70 bg-card rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 rounded-xl border-muted/80 bg-background/50 hover:bg-background transition-colors h-10 text-sm"
              placeholder="Tìm theo tiêu đề..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={published} onValueChange={(v) => { setPublished(v); setPage(1) }}>
            <SelectTrigger className="w-[180px] rounded-xl border-muted/80 h-10 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Published</SelectItem>
              <SelectItem value="false">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-muted/70 bg-card rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Tiêu đề</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Phân loại</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Tags</TableHead>
                    {extraColumns.map((c) => (
                      <TableHead key={c.header} className={`${c.className} text-xs font-bold uppercase tracking-wider text-muted-foreground py-3`}>{c.header}</TableHead>
                    ))}
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3">Trạng thái</TableHead>
                    <TableHead className="w-24 py-3" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5 + extraColumns.length} className="text-center text-sm text-muted-foreground py-12">
                        Chưa có dữ liệu cho mục này.
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="py-3.5">
                        <div className="font-bold text-xs text-foreground line-clamp-1">{row.title}</div>
                        <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{row.id}</div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge className="bg-[#8B4AFF]/10 text-[#8B4AFF] border-none shadow-none font-bold uppercase text-[9px] rounded-full px-2 py-0.5">
                          {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(row.tags || []).slice(0, 3).map((t) => (
                            <Badge key={t} className="bg-muted text-muted-foreground/85 border-none shadow-none text-[10px] rounded-full px-1.5 py-0">
                              {t}
                            </Badge>
                          ))}
                          {(row.tags || []).length > 3 && (
                            <Badge className="bg-muted text-muted-foreground/60 border-none shadow-none text-[9px] rounded-full px-1 py-0">
                              +{row.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {extraColumns.map((c) => (
                        <TableCell key={c.header} className={`${c.className} py-3.5 text-xs font-semibold`}>
                          {c.render(row)}
                        </TableCell>
                      ))}
                      <TableCell className="py-3.5">
                        {row.isPublished ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none font-semibold rounded-full px-2 py-0.5 text-[10px]">
                            Published
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-none font-semibold rounded-full px-2 py-0.5 text-[10px]">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                            <Link to={`${basePath}/${row.id}`}>
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-[#8B4AFF]" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)} className="h-8 w-8 p-0 rounded-full hover:bg-rose-50">
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-muted/50 bg-muted/5">
              <div className="text-xs text-muted-foreground">
                Tổng cộng <span className="font-semibold text-foreground">{pagination.total}</span> dòng — Trang {page}/{pagination.pages || 1}
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

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-lg font-bold text-foreground">Xoá nội dung này?</DialogTitle>
            <DialogDescription className="text-sm">
              Hành động này không thể hoàn tác. Các tham chiếu (bài học, nghi thức, liên kết...) liên quan đến nội dung này sẽ bị đặt về null.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-full text-xs h-9">Huỷ bỏ</Button>
            <Button 
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(deleteId)}
              className="rounded-full text-xs h-9 font-semibold"
            >
              Xoá vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
