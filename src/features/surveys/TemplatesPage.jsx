import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { templatesApi } from './api'
import { TemplateEditor } from './TemplateEditor'

export function TemplatesPage() {
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [newTpl, setNewTpl] = useState({
    code: '', name: '', surveyType: 'ONBOARDING', displayMode: 'one_question_per_screen',
    description: '', isRepeatable: false, status: 'draft',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'survey-templates'],
    queryFn: () => templatesApi.list({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: () => templatesApi.create(newTpl),
    onSuccess: (created) => {
      toast.success('Đã tạo template')
      qc.invalidateQueries({ queryKey: ['admin', 'survey-templates'] })
      setCreating(false)
      setEditingId(created.id)
      setNewTpl({
        code: '', name: '', surveyType: 'ONBOARDING', displayMode: 'one_question_per_screen',
        description: '', isRepeatable: false, status: 'draft',
      })
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => templatesApi.remove(id),
    onSuccess: () => {
      toast.success('Đã xoá')
      qc.invalidateQueries({ queryKey: ['admin', 'survey-templates'] })
      setDeleteId(null)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  const templates = data?.templates || []

  if (editingId) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setEditingId(null)}>← Quay lại danh sách template</Button>
        <TemplateEditor templateId={editingId} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Template khảo sát</h1>
          <p className="text-sm text-muted-foreground">
            Template chứa câu hỏi + dải điểm. Một template dùng cho nhiều Survey.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tạo template
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-center">Câu hỏi</TableHead>
                <TableHead className="text-center">Ranges</TableHead>
                <TableHead className="text-center">Surveys dùng</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    Chưa có template nào.
                  </TableCell>
                </TableRow>
              )}
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.code}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant="outline">{t.surveyType}</Badge></TableCell>
                  <TableCell className="text-center">{t._count?.questions ?? 0}</TableCell>
                  <TableCell className="text-center">{t._count?.scoreRanges ?? 0}</TableCell>
                  <TableCell className="text-center">{t._count?.surveys ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(t.id)}>
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(t.id)}
                      disabled={(t._count?.surveys ?? 0) > 0}
                      title={(t._count?.surveys ?? 0) > 0 ? 'Còn survey đang dùng' : ''}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo template mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Code *</Label>
              <Input
                value={newTpl.code}
                onChange={(e) => setNewTpl({ ...newTpl, code: e.target.value })}
                placeholder="onboarding_v1"
              />
            </div>
            <div>
              <Label>Tên *</Label>
              <Input
                value={newTpl.name}
                onChange={(e) => setNewTpl({ ...newTpl, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Loại</Label>
              <Select value={newTpl.surveyType} onValueChange={(v) => setNewTpl({ ...newTpl, surveyType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONBOARDING">ONBOARDING</SelectItem>
                  <SelectItem value="PERSONALITY">PERSONALITY</SelectItem>
                  <SelectItem value="RELATIONSHIP">RELATIONSHIP</SelectItem>
                  <SelectItem value="WELLBEING">WELLBEING</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Huỷ</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xoá template?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Huỷ</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteId)}>
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
