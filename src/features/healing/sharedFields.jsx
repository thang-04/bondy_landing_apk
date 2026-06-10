import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// Common HealingContent core fields used in every form.
export function ContentCoreFields({ form, setForm }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label>Tiêu đề *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Tóm tắt *</Label>
        <Textarea
          rows={2}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Thumbnail URL</Label>
        <Input
          value={form.thumbnailUrl || ''}
          onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value || null })}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="emotion / mindfulness / sleep..."
        />
      </div>
      <div className="space-y-2">
        <Label>Tags (cách nhau bằng dấu phẩy)</Label>
        <Input
          value={(form.tags || []).join(', ')}
          onChange={(e) =>
            setForm({
              ...form,
              tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Mood targets (vd: ANXIOUS, SAD)</Label>
        <Input
          value={(form.moodTargets || []).join(', ')}
          onChange={(e) =>
            setForm({
              ...form,
              moodTargets: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Context targets (vd: BREAKUP, TRIGGER)</Label>
        <Input
          value={(form.contextTargets || []).join(', ')}
          onChange={(e) =>
            setForm({
              ...form,
              contextTargets: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Access level</Label>
        <Select value={form.accessLevel} onValueChange={(v) => setForm({ ...form, accessLevel: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">FREE</SelectItem>
            <SelectItem value="PREMIUM">PREMIUM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Language</Label>
        <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vi">Tiếng Việt</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Review status</Label>
        <Select value={form.reviewStatus} onValueChange={(v) => setForm({ ...form, reviewStatus: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="APPROVED">APPROVED</SelectItem>
            <SelectItem value="REJECTED">REJECTED</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <Select
          value={form.isPublished ? 'true' : 'false'}
          onValueChange={(v) => setForm({ ...form, isPublished: v === 'true' })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Draft (chưa xuất bản)</SelectItem>
            <SelectItem value="true">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export const DEFAULT_CORE = {
  title: '',
  summary: '',
  thumbnailUrl: '',
  category: 'general',
  tags: [],
  moodTargets: [],
  contextTargets: [],
  accessLevel: 'FREE',
  language: 'vi',
  sourceType: 'CURATED',
  reviewStatus: 'APPROVED',
  isPublished: false,
}
