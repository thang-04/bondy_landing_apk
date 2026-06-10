import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentCoreFields, DEFAULT_CORE } from '../sharedFields'
import { articlesApi } from './api'

const EMPTY = {
  ...DEFAULT_CORE,
  body: '',
  estimatedReadMinutes: 5,
  authorName: '',
  sourceName: '',
  externalUrl: '',
  copyrightNote: '',
}

export function ArticleFormPage() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'healing', 'articles', id],
    queryFn: () => articlesApi.get(id),
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
        body: data.articleDetail?.body || '',
        estimatedReadMinutes: data.articleDetail?.estimatedReadMinutes || 5,
        authorName: data.articleDetail?.authorName || '',
        sourceName: data.articleDetail?.sourceName || '',
        externalUrl: data.articleDetail?.externalUrl || '',
        copyrightNote: data.articleDetail?.copyrightNote || '',
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload) => isNew ? articlesApi.create(payload) : articlesApi.update(id, payload),
    onSuccess: (saved) => {
      toast.success(isNew ? 'Đã tạo' : 'Đã lưu')
      qc.invalidateQueries({ queryKey: ['admin', 'healing', 'articles'] })
      if (isNew && saved?.id) nav(`/healing/articles/${saved.id}`)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  function handleSave() {
    if (!form.title || !form.summary || !form.body || !form.authorName) {
      toast.error('Cần nhập đủ tiêu đề, tóm tắt, nội dung, tác giả')
      return
    }
    mutation.mutate({
      ...form,
      thumbnailUrl: form.thumbnailUrl || null,
      sourceName: form.sourceName || null,
      externalUrl: form.externalUrl || null,
      copyrightNote: form.copyrightNote || null,
      estimatedReadMinutes: Number(form.estimatedReadMinutes) || 1,
    })
  }

  if (!isNew && isLoading) return <div className="text-sm text-muted-foreground">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/healing/articles"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {isNew ? 'Tạo bài đọc mới' : form.title}
            </h1>
            {!isNew && <p className="text-sm font-mono text-muted-foreground">{id}</p>}
          </div>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Lưu
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Thông tin bài đọc</CardTitle></CardHeader>
        <CardContent>
          <ContentCoreFields form={form} setForm={setForm} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nội dung</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tác giả *</Label>
              <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Thời lượng đọc (phút) *</Label>
              <Input
                type="number" min="1"
                value={form.estimatedReadMinutes}
                onChange={(e) => setForm({ ...form, estimatedReadMinutes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nguồn</Label>
              <Input value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>External URL</Label>
              <Input value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú bản quyền</Label>
              <Input value={form.copyrightNote} onChange={(e) => setForm({ ...form, copyrightNote: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Body (Markdown) *</Label>
            <Textarea
              rows={16}
              className="font-mono text-sm"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={'# Tiêu đề\n\nNội dung bài viết...'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
