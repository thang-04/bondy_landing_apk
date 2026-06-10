import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ContentCoreFields, DEFAULT_CORE } from '../sharedFields'
import { exercisesApi } from './api'

const EMPTY = {
  ...DEFAULT_CORE,
  exerciseType: 'BREATHING',
  durationMinutes: 5,
  difficulty: 'EASY',
  steps: [''],
  completionCriteria: '',
  safetyNote: '',
}

export function ExerciseFormPage() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'healing', 'exercises', id],
    queryFn: () => exercisesApi.get(id),
    enabled: !isNew,
  })

  useEffect(() => {
    if (data) {
      setForm({
        ...DEFAULT_CORE,
        ...data,
        tags: data.tags || [],
        moodTargets: data.moodTargets || [],
        contextTargets: data.contextTargets || [],
        exerciseType: data.exerciseDetail?.exerciseType || 'BREATHING',
        durationMinutes: data.exerciseDetail?.durationMinutes || 5,
        difficulty: data.exerciseDetail?.difficulty || 'EASY',
        steps: data.exerciseDetail?.steps?.length ? data.exerciseDetail.steps : [''],
        completionCriteria: data.exerciseDetail?.completionCriteria || '',
        safetyNote: data.exerciseDetail?.safetyNote || '',
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload) => isNew ? exercisesApi.create(payload) : exercisesApi.update(id, payload),
    onSuccess: (saved) => {
      toast.success(isNew ? 'Đã tạo' : 'Đã lưu')
      qc.invalidateQueries({ queryKey: ['admin', 'healing', 'exercises'] })
      if (isNew && saved?.id) nav(`/healing/exercises/${saved.id}`)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  function handleSave() {
    const cleanSteps = (form.steps || []).map((s) => s.trim()).filter(Boolean)
    if (!form.title || !form.summary || !form.completionCriteria || cleanSteps.length === 0) {
      toast.error('Cần nhập đủ tiêu đề, tóm tắt, completion criteria và ít nhất 1 bước')
      return
    }
    mutation.mutate({
      ...form,
      thumbnailUrl: form.thumbnailUrl || null,
      safetyNote: form.safetyNote || null,
      durationMinutes: Number(form.durationMinutes) || 1,
      steps: cleanSteps,
    })
  }

  function moveStep(i, dir) {
    const j = i + dir
    if (j < 0 || j >= form.steps.length) return
    const copy = [...form.steps]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    setForm({ ...form, steps: copy })
  }

  if (!isNew && isLoading) return <div className="text-sm text-muted-foreground">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/healing/exercises"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {isNew ? 'Tạo bài tập mới' : form.title}
            </h1>
            {!isNew && <p className="text-sm font-mono text-muted-foreground">{id}</p>}
          </div>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Lưu
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Cấu hình bài tập</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Loại bài tập</Label>
              <Select
                value={form.exerciseType}
                onValueChange={(v) => setForm({ ...form, exerciseType: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BREATHING">BREATHING</SelectItem>
                  <SelectItem value="GROUNDING">GROUNDING</SelectItem>
                  <SelectItem value="JOURNALING">JOURNALING</SelectItem>
                  <SelectItem value="MEDITATION">MEDITATION</SelectItem>
                  <SelectItem value="MOVEMENT">MOVEMENT</SelectItem>
                  <SelectItem value="REFLECTION">REFLECTION</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Độ khó</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">EASY</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HARD">HARD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Thời lượng (phút) *</Label>
              <Input
                type="number" min="1"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Các bước thực hiện *</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setForm({ ...form, steps: [...form.steps, ''] })}
              >
                <Plus className="mr-1 h-4 w-4" /> Thêm bước
              </Button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="pt-2 w-8 text-sm font-mono text-muted-foreground">{i + 1}.</div>
                  <Textarea
                    rows={2}
                    value={step}
                    onChange={(e) => {
                      const copy = [...form.steps]; copy[i] = e.target.value
                      setForm({ ...form, steps: copy })
                    }}
                    placeholder="Mô tả bước..."
                  />
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => moveStep(i, -1)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={i === form.steps.length - 1} onClick={() => moveStep(i, 1)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setForm({ ...form, steps: form.steps.filter((_, j) => j !== i) })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tiêu chí hoàn thành *</Label>
            <Textarea
              rows={2}
              value={form.completionCriteria}
              onChange={(e) => setForm({ ...form, completionCriteria: e.target.value })}
              placeholder="Vd: Hoàn thành đủ 4 vòng hít thở"
            />
          </div>
          <div className="space-y-2">
            <Label>Ghi chú an toàn</Label>
            <Textarea
              rows={2}
              value={form.safetyNote}
              onChange={(e) => setForm({ ...form, safetyNote: e.target.value })}
              placeholder="Vd: Dừng ngay nếu chóng mặt"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
        <CardContent>
          <ContentCoreFields form={form} setForm={setForm} />
        </CardContent>
      </Card>
    </div>
  )
}
