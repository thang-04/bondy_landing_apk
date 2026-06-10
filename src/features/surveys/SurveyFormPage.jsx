import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { surveysApi, templatesApi } from './api'
import { TemplateEditor } from './TemplateEditor'

const EMPTY = {
  code: '',
  title: '',
  description: '',
  surveyTemplateId: '',
  estimatedDurationSeconds: 300,
  status: 'draft',
}

export function SurveyFormPage() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState(EMPTY)

  const { data: surveyData, isLoading: surveyLoading } = useQuery({
    queryKey: ['admin', 'surveys', id],
    queryFn: () => surveysApi.get(id),
    enabled: !isNew,
  })

  const { data: templatesData } = useQuery({
    queryKey: ['admin', 'survey-templates', 'all'],
    queryFn: () => templatesApi.list({ limit: 100 }),
  })

  useEffect(() => {
    if (surveyData) {
      setForm({
        code: surveyData.code || '',
        title: surveyData.title || '',
        description: surveyData.description || '',
        surveyTemplateId: surveyData.surveyTemplateId || '',
        estimatedDurationSeconds: surveyData.estimatedDurationSeconds || 300,
        status: surveyData.status || 'draft',
      })
    }
  }, [surveyData])

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isNew ? surveysApi.create(payload) : surveysApi.update(id, payload),
    onSuccess: (saved) => {
      toast.success(isNew ? 'Đã tạo khảo sát' : 'Đã lưu')
      qc.invalidateQueries({ queryKey: ['admin', 'surveys'] })
      if (isNew && saved?.id) nav(`/surveys/${saved.id}`)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  function handleSave() {
    if (!form.code || !form.title || !form.surveyTemplateId) {
      toast.error('Vui lòng nhập đủ code, tiêu đề và chọn template')
      return
    }
    saveMutation.mutate({
      ...form,
      estimatedDurationSeconds: Number(form.estimatedDurationSeconds) || null,
    })
  }

  const templates = templatesData?.templates || []
  const selectedTemplateId = form.surveyTemplateId

  if (!isNew && surveyLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/surveys"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {isNew ? 'Tạo khảo sát mới' : form.title || 'Sửa khảo sát'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Khảo sát = Template + tiêu đề/code/status' : `ID: ${id}`}
            </p>
          </div>
        </div>
        <Button disabled={saveMutation.isPending} onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Lưu khảo sát
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
          <TabsTrigger value="template" disabled={!selectedTemplateId}>
            Câu hỏi & Điểm số
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Thông tin khảo sát</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="onboarding_2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Tiêu đề *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Mô tả</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Template *</Label>
                <Select
                  value={form.surveyTemplateId}
                  onValueChange={(v) => setForm({ ...form, surveyTemplateId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Chọn template" /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.surveyType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Template chứa các câu hỏi + dải điểm. Chọn template rồi sang tab kế bên để chỉnh.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Thời lượng ước tính (giây)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.estimatedDurationSeconds}
                  onChange={(e) => setForm({ ...form, estimatedDurationSeconds: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          {selectedTemplateId && (
            <TemplateEditor templateId={selectedTemplateId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
