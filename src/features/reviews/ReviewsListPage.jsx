import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, Star, MessageSquare, Heart, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
import { reviewsApi } from './api'

function ReviewAvatar({ review }) {
  const [error, setError] = useState(false)
  const rawUrl = review.avatar

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
  const displayName = review.name || 'U'
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

export function ReviewsListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch reviews using react-query
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => reviewsApi.list(),
  })

  // Mutation for deleting a review
  const deleteMutation = useMutation({
    mutationFn: (id) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Đã xóa đánh giá thành công!')
      setIsDeleteDialogOpen(false)
      setSelectedReview(null)
    },
    onError: (err) => {
      toast.error(err.message || 'Lỗi khi xóa đánh giá')
    },
  })

  const reviews = Array.isArray(response) ? response : (response?.data || [])

  // Filter reviews based on search text
  const filteredReviews = reviews.filter((review) => {
    const searchLower = search.toLowerCase()
    return (
      review.name.toLowerCase().includes(searchLower) ||
      review.text.toLowerCase().includes(searchLower) ||
      (review.status && review.status.toLowerCase().includes(searchLower)) ||
      (review.mood && review.mood.toLowerCase().includes(searchLower))
    )
  })

  // Calculate statistics
  const totalReviews = reviews.length
  const avgRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0
  const fiveStars = reviews.filter((r) => r.rating === 5).length
  const otherStars = totalReviews - fiveStars

  const handleDeleteClick = (review) => {
    setSelectedReview(review)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedReview) {
      deleteMutation.mutate(selectedReview.id)
    }
  }

  // Helper to render rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-amber-400' : 'text-zinc-200'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#FF5A36]" />
            Đánh giá người dùng
          </h1>
          <p className="text-xs text-muted-foreground">
            Xem, tìm kiếm và quản lý các câu chuyện, phản hồi từ cộng đồng trên Landing Page
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted/70 bg-card rounded-2xl shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF5A36]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tổng đánh giá</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#FF5A36] opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{totalReviews}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Lượt phản hồi ghi nhận trên hệ thống</p>
          </CardContent>
        </Card>

        <Card className="border-muted/70 bg-card rounded-2xl shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EA2A5A]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Điểm trung bình</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground flex items-baseline gap-1.5">
              {avgRating} <span className="text-sm font-semibold text-zinc-400">/ 5 ★</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Đánh giá trung bình từ trải nghiệm thực tế
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted/70 bg-card rounded-2xl shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B4AFF]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Đánh giá 5 sao</CardTitle>
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{fiveStars}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {otherStars > 0 ? `Chiếm đa số tuyệt đối (${fiveStars}/${totalReviews})` : '100% đánh giá ở mức tối đa'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="p-5 border-muted/70 bg-card rounded-2xl shadow-sm">
        {/* Search tool */}
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Tìm theo tên, nội dung đánh giá..."
            className="pl-9 rounded-xl border-muted/80 bg-background/50 hover:bg-background transition-colors h-10 text-sm focus-visible:ring-brand-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table representation */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#FF5A36] border-r-transparent" />
          </div>
        ) : isError ? (
          <div className="flex h-48 items-center justify-center text-sm text-rose-500 font-medium">
            Có lỗi xảy ra: {error?.message || 'Không thể tải dữ liệu'}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-zinc-400 text-sm gap-2">
            <MessageSquare className="h-8 w-8 text-zinc-300" />
            Không tìm thấy đánh giá nào
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-muted/60">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[200px] font-bold text-zinc-600">Người đánh giá</TableHead>
                  <TableHead className="w-[120px] font-bold text-zinc-600">Đánh giá (Sao)</TableHead>
                  <TableHead className="w-[120px] font-bold text-zinc-600">Cảm xúc</TableHead>
                  <TableHead className="font-bold text-zinc-600">Nội dung câu chuyện</TableHead>
                  <TableHead className="w-[100px] text-right font-bold text-zinc-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ReviewAvatar review={review} />
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-foreground leading-tight">{review.name}</p>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-brand-primary/20 text-[#FF5A36] bg-[#FF5A36]/5 rounded-md font-bold">
                            {review.status || 'Người dùng'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-neutral-100 rounded-lg px-2.5 py-1 w-fit border border-neutral-200/50">
                        <span>{review.emoji}</span>
                        <span>{review.mood}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
                        {review.text}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        onClick={() => handleDeleteClick(review)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-2xl border-muted/80 bg-white max-w-sm">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-foreground">Xác nhận xóa đánh giá</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa đánh giá của <strong className="text-foreground">{selectedReview?.name}</strong>? Hành động này không thể hoàn tác và đánh giá sẽ lập tức biến mất khỏi Landing Page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl h-10 text-sm"
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="rounded-xl h-10 text-sm bg-rose-600 hover:bg-rose-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
