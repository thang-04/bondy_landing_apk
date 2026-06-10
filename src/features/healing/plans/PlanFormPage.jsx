import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContentCoreFields, DEFAULT_CORE } from '../sharedFields'
import { coursesApi } from './api'
import { articlesApi } from '../articles/api'
import { audiosApi } from '../audios/api'
import { exercisesApi } from '../exercises/api'

const EMPTY = {
  ...DEFAULT_CORE,
  durationDays: 7,
  goal: '',
  scheduleType: 'SEQUENTIAL',
  lessons: [],
}

function emptyLesson(dayNumber) {
  return {
    _key: `tmp_${Math.random().toString(36).slice(2, 8)}`,
    dayNumber,
    title: `Ngày ${dayNumber}`,
    articleContentId: null,
    exerciseContentId: null,
    audioContentId: null,
    ritualContentId: null,
    reflectionPrompt: '',
    estimatedMinutes: 15,
    unlockRule: 'SEQUENTIAL',
  }
}

export function PlanFormPage() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'healing', 'courses', id],
    queryFn: () => coursesApi.get(id),
    enabled: !isNew,
  })

  const { data: articlesData } = useQuery({
    queryKey: ['admin', 'healing', 'articles', 'all-for-plan'],
    queryFn: () => articlesApi.list({ limit: 100 }),
  })
  const { data: audiosData } = useQuery({
    queryKey: ['admin', 'healing', 'audios', 'all-for-plan'],
    queryFn: () => audiosApi.list({ limit: 100 }),
  })
  const { data: exercisesData } = useQuery({
    queryKey: ['admin', 'healing', 'exercises', 'all-for-plan'],
    queryFn: () => exercisesApi.list({ limit: 100 }),
  })

  const articles = articlesData?.items || []
  const audios = audiosData?.items || []
  const exercises = exercisesData?.items || []

  useEffect(() => {
    if (data) {
      setForm({
        ...DEFAULT_CORE,
        ...data,
        tags: data.tags || [],
        moodTargets: data.moodTargets || [],
        contextTargets: data.contextTargets || [],
        durationDays: data.course?.durationDays || 7,
        goal: data.course?.goal || '',
        scheduleType: data.course?.scheduleType || 'SEQUENTIAL',
        lessons: (data.course?.lessons || []).map((l) => ({ ...l, _key: l.id })),
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload) => isNew ? coursesApi.create(payload) : coursesApi.update(id, payload),
    onSuccess: (saved) => {
      toast.success(isNew ? 'Đã tạo lộ trình' : 'Đã lưu')
      qc.invalidateQueries({ queryKey: ['admin', 'healing', 'courses'] })
      if (isNew && saved?.id) nav(`/healing/plans/${saved.id}`)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  function handleSave() {
    if (!form.title || !form.summary || !form.goal) {
      toast.error('Cần nhập đủ tiêu đề, tóm tắt và mục tiêu')
      return
    }
    const payload = {
      ...form,
      thumbnailUrl: form.thumbnailUrl || null,
      durationDays: Number(form.durationDays) || 1,
    }
    if (!isNew) {
      // Sanitize lessons
      payload.lessons = form.lessons.map((l, i) => {
        const { _key, courseId, ...rest } = l
        return {
          ...rest,
          dayNumber: rest.dayNumber || i + 1,
          estimatedMinutes: Number(rest.estimatedMinutes) || 10,
          articleContentId: rest.articleContentId || null,
          exerciseContentId: rest.exerciseContentId || null,
          audioContentId: rest.audioContentId || null,
          ritualContentId: rest.ritualContentId || null,
          reflectionPrompt: rest.reflectionPrompt || null,
        }
      })
    } else {
      // Cannot send lessons on create — backend create endpoint only accepts core
      delete payload.lessons
    }
    mutation.mutate(payload)
  }

  function addLesson() {
    const nextDay = (form.lessons[form.lessons.length - 1]?.dayNumber || 0) + 1
    setForm({ ...form, lessons: [...form.lessons, emptyLesson(nextDay)] })
  }
  function updateLesson(i, patch) {
    const copy = [...form.lessons]
    copy[i] = { ...copy[i], ...patch }
    setForm({ ...form, lessons: copy })
  }
  function removeLesson(i) {
    setForm({ ...form, lessons: form.lessons.filter((_, j) => j !== i) })
  }

  if (!isNew && isLoading) return <div className="text-sm text-muted-foreground">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/healing/plans"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {isNew ? 'Tạo lộ trình mới' : form.title}
            </h1>
            {!isNew && <p className="text-sm font-mono text-muted-foreground">{id}</p>}
          </div>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Lưu
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Thông tin lộ trình</TabsTrigger>
          <TabsTrigger value="lessons" disabled={isNew}>
            Bài học theo ngày ({form.lessons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Cấu hình lộ trình</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Số ngày *</Label>
                <Input
                  type="number" min="1"
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Schedule type</Label>
                <Select
                  value={form.scheduleType}
                  onValueChange={(v) => setForm({ ...form, scheduleType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEQUENTIAL">SEQUENTIAL</SelectItem>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Mục tiêu lộ trình *</Label>
                <Textarea
                  rows={2}
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="Vd: Lấy lại bình yên sau chia tay trong 7 ngày"
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
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bài học theo ngày</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Mỗi ngày gắn 1+ nội dung (article / audio / exercise). Nhấn Lưu ở trên cùng để áp dụng.
                </p>
              </div>
              <Button onClick={addLesson}>
                <Plus className="mr-2 h-4 w-4" /> Thêm ngày
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.lessons.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Chưa có ngày nào. Bấm "Thêm ngày" ở trên.
                </div>
              )}
              {form.lessons.map((lesson, i) => (
                <div key={lesson._key || lesson.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge>Ngày</Badge>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={lesson.dayNumber}
                        onChange={(e) => updateLesson(i, { dayNumber: Number(e.target.value) })}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeLesson(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs">Tiêu đề ngày *</Label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => updateLesson(i, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Thời lượng (phút)</Label>
                      <Input
                        type="number"
                        value={lesson.estimatedMinutes}
                        onChange={(e) => updateLesson(i, { estimatedMinutes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <ContentPicker
                      label="Bài đọc"
                      value={lesson.articleContentId}
                      items={articles}
                      onChange={(v) => updateLesson(i, { articleContentId: v })}
                    />
                    <ContentPicker
                      label="Audio"
                      value={lesson.audioContentId}
                      items={audios}
                      onChange={(v) => updateLesson(i, { audioContentId: v })}
                    />
                    <ContentPicker
                      label="Bài tập"
                      value={lesson.exerciseContentId}
                      items={exercises}
                      onChange={(v) => updateLesson(i, { exerciseContentId: v })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Reflection prompt</Label>
                    <Textarea
                      rows={2}
                      value={lesson.reflectionPrompt || ''}
                      onChange={(e) => updateLesson(i, { reflectionPrompt: e.target.value })}
                      placeholder="Câu hỏi suy ngẫm cuối ngày"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContentPicker({ label, value, items, onChange }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? null : v)}>
        <SelectTrigger><SelectValue placeholder="— Không —" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— Không —</SelectItem>
          {items.map((it) => (
            <SelectItem key={it.id} value={it.id}>{it.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
