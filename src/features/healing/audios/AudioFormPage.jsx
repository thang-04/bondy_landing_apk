import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentCoreFields, DEFAULT_CORE } from '../sharedFields'
import { audiosApi } from './api'

const EMPTY = {
  ...DEFAULT_CORE,
  audioUrl: '',
  durationSeconds: 0,
  transcript: '',
  narratorName: '',
}

export function AudioFormPage() {
  const { id } = useParams()
  const isNew = !id
  const nav = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef(null)
  const audioRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'healing', 'audios', id],
    queryFn: () => audiosApi.get(id),
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
        audioUrl: data.audioDetail?.audioUrl || '',
        durationSeconds: data.audioDetail?.durationSeconds || 0,
        transcript: data.audioDetail?.transcript || '',
        narratorName: data.audioDetail?.narratorName || '',
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (payload) => isNew ? audiosApi.create(payload) : audiosApi.update(id, payload),
    onSuccess: (saved) => {
      toast.success(isNew ? 'Đã tạo' : 'Đã lưu')
      qc.invalidateQueries({ queryKey: ['admin', 'healing', 'audios'] })
      if (isNew && saved?.id) nav(`/healing/audios/${saved.id}`)
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      toast.error('File phải là audio (mp3 / m4a / ogg…)')
      return
    }
    try {
      setUploading(true)
      const result = await audiosApi.upload(file)
      const url = result?.url || result?.publicUrl || result?.location
      if (!url) {
        toast.error('Upload server không trả về URL — kiểm tra response /api/upload')
        return
      }
      // Try to read duration from the file
      const localUrl = URL.createObjectURL(file)
      const tmp = new Audio(localUrl)
      tmp.addEventListener('loadedmetadata', () => {
        setForm((f) => ({
          ...f,
          audioUrl: url,
          durationSeconds: Math.round(tmp.duration || f.durationSeconds || 0),
        }))
        URL.revokeObjectURL(localUrl)
      })
      tmp.addEventListener('error', () => {
        setForm((f) => ({ ...f, audioUrl: url }))
      })
      toast.success('Upload thành công')
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Upload thất bại')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function handleSave() {
    if (!form.title || !form.summary || !form.audioUrl) {
      toast.error('Cần nhập đủ tiêu đề, tóm tắt và audio URL')
      return
    }
    mutation.mutate({
      ...form,
      thumbnailUrl: form.thumbnailUrl || null,
      transcript: form.transcript || null,
      narratorName: form.narratorName || null,
      durationSeconds: Number(form.durationSeconds) || 1,
    })
  }

  if (!isNew && isLoading) return <div className="text-sm text-muted-foreground">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/healing/audios"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {isNew ? 'Tạo audio mới' : form.title}
            </h1>
            {!isNew && <p className="text-sm font-mono text-muted-foreground">{id}</p>}
          </div>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Lưu
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>File audio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[300px] space-y-2">
              <Label>Audio URL *</Label>
              <Input
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                placeholder="https://... hoặc upload bằng nút bên cạnh"
              />
            </div>
            <div>
              <input
                ref={fileInput}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {uploading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải</>
                  : <><Upload className="mr-2 h-4 w-4" /> Upload file</>}
              </Button>
            </div>
          </div>
          {form.audioUrl && (
            <audio ref={audioRef} controls src={form.audioUrl} className="w-full">
              Trình duyệt không hỗ trợ audio.
            </audio>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Duration (seconds) *</Label>
              <Input
                type="number"
                min="1"
                value={form.durationSeconds}
                onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Tự động đọc từ file khi upload. Có thể chỉnh tay nếu cần.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Narrator</Label>
              <Input
                value={form.narratorName}
                onChange={(e) => setForm({ ...form, narratorName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Transcript</Label>
            <Textarea
              rows={6}
              value={form.transcript}
              onChange={(e) => setForm({ ...form, transcript: e.target.value })}
              placeholder="Lời thoại (tuỳ chọn)"
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
