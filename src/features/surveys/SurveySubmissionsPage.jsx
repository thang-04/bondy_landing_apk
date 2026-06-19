import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { surveysApi } from './api'

function dt(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('vi-VN') } catch { return iso }
}

export function SurveySubmissionsPage() {
  const { id } = useParams()
  const [page, setPage] = useState(1)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
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
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
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
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(s)}
                        className="flex items-center gap-1.5 mx-auto"
                      >
                        <Eye className="h-4 w-4" /> Chi tiết
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

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Chi tiết câu trả lời
            </DialogTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Người nộp: <span className="font-medium text-foreground">{selectedSubmission?.user?.email}</span>
              {selectedSubmission?.user?.name && ` (${selectedSubmission.user.name})`}
            </div>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 mt-4">
              {/* Submission summary info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border text-sm">
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Trạng thái</div>
                  <div className="mt-1 font-medium">
                    <Badge variant={selectedSubmission.submittedAt ? 'success' : 'warning'}>
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Tổng điểm</div>
                  <div className="mt-1 font-semibold text-lg text-rose-600 font-mono">
                    {selectedSubmission.totalScore ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Kết quả Mode</div>
                  <div className="mt-1">
                    {selectedSubmission.finalModeLabel ? (
                      <div className="font-semibold text-rose-500">
                        {selectedSubmission.finalModeLabel} <span className="text-xs text-muted-foreground font-mono font-normal">({selectedSubmission.finalModeCode})</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-mono">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Thời gian hoàn thành</div>
                  <div className="mt-1 font-medium">
                    {dt(selectedSubmission.submittedAt)}
                  </div>
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm border-b pb-2">Danh sách câu trả lời</h3>
                
                {(!selectedSubmission.answers || selectedSubmission.answers.length === 0) ? (
                  <div className="text-center py-6 text-sm text-muted-foreground italic">
                    Không có dữ liệu câu trả lời.
                  </div>
                ) : (
                  [...selectedSubmission.answers]
                    .sort((a, b) => (a.question?.orderNo ?? 0) - (b.question?.orderNo ?? 0))
                    .map((ans, idx) => {
                      const q = ans.question;
                      if (!q) return null;

                      // Helper to render choice answer label(s)
                      let renderedAnswer = '—';
                      if (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'CHOICE' || q.questionType === 'YES_NO') {
                        const chosenOpt = q.options?.find(
                          (o) =>
                            o.id === ans.answerText ||
                            o.optionValue === ans.answerText ||
                            o.optionLabel === ans.answerText ||
                            o.optionCode === ans.answerText
                        );
                        renderedAnswer = chosenOpt ? chosenOpt.optionLabel : (ans.answerText || '—');
                      } else if (q.questionType === 'MULTIPLE_CHOICE' && Array.isArray(ans.answerJson)) {
                        const chosenOpts = q.options?.filter((o) => ans.answerJson.includes(o.id));
                        renderedAnswer = chosenOpts?.length
                          ? chosenOpts.map((o) => o.optionLabel).join(', ')
                          : (ans.answerText || '—');
                      } else if (q.questionType === 'SLIDER' || q.questionType === 'NUMBER') {
                        renderedAnswer = ans.answerNumber !== null && ans.answerNumber !== undefined
                          ? String(ans.answerNumber)
                          : (ans.answerText || '—');
                      } else if (q.questionType === 'TEXT') {
                        renderedAnswer = ans.answerText || '—';
                      } else {
                        renderedAnswer = ans.answerText || ans.answerNumber || '—';
                      }

                      return (
                        <div key={ans.id} className="p-4 rounded-lg border bg-card hover:bg-muted/5 transition-colors">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                Câu {q.orderNo ?? (idx + 1)}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] text-zinc-500 font-mono">
                                {q.code}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200">
                                {q.questionType}
                              </Badge>
                            </div>
                            {q.isScored && ans.calculatedScore !== null && (
                              <div className="text-xs font-mono text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                                +{ans.calculatedScore} điểm
                              </div>
                            )}
                          </div>
                          
                          <div className="font-semibold text-sm text-zinc-900 mb-2">
                            {q.questionText}
                          </div>
                          
                          <div className="p-2.5 rounded bg-zinc-50 border border-dashed border-zinc-200 text-sm">
                            <span className="text-zinc-500 mr-1.5 text-xs font-medium">Trả lời:</span>
                            <span className="font-semibold text-zinc-800">{renderedAnswer}</span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
