import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronUp, ChevronDown, Save } from 'lucide-react'
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
import { templatesApi } from './api'

const QUESTION_TYPES = [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'YES_NO',
  'SLIDER',
  'TEXT',
  'NUMBER',
  'DATE',
]

function uid() {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`
}

function newQuestion(orderNo) {
  return {
    _key: uid(),
    code: `q_${orderNo + 1}`,
    questionText: '',
    description: '',
    questionType: 'SINGLE_CHOICE',
    orderNo: orderNo + 1,
    isRequired: true,
    isMultipleChoice: false,
    isScored: true,
    placeholder: '',
    helpText: '',
    minValue: null,
    maxValue: null,
    stepValue: null,
    options: [],
  }
}

function newOption(orderNo) {
  return {
    _key: uid(),
    optionCode: `opt_${orderNo + 1}`,
    optionLabel: '',
    optionValue: String(orderNo + 1),
    scoreValue: 0,
    description: '',
    orderNo: orderNo + 1,
  }
}

function newRange() {
  return {
    _key: uid(),
    minScore: 0,
    maxScore: 0,
    modeCode: '',
    modeLabel: '',
    description: '',
  }
}

export function TemplateEditor({ templateId }) {
  const qc = useQueryClient()
  const [questions, setQuestions] = useState([])
  const [ranges, setRanges] = useState([])

  const { data: tpl, isLoading } = useQuery({
    queryKey: ['admin', 'survey-templates', templateId],
    queryFn: () => templatesApi.get(templateId),
    enabled: !!templateId,
  })

  useEffect(() => {
    if (tpl) {
      setQuestions(
        (tpl.questions || []).map((q) => ({
          ...q,
          _key: q.id,
          options: (q.options || []).map((o) => ({ ...o, _key: o.id })),
        }))
      )
      setRanges((tpl.scoreRanges || []).map((r) => ({ ...r, _key: r.id })))
    }
  }, [tpl])

  const saveMutation = useMutation({
    mutationFn: (payload) => templatesApi.update(templateId, payload),
    onSuccess: () => {
      toast.success('Đã lưu template')
      qc.invalidateQueries({ queryKey: ['admin', 'survey-templates', templateId] })
    },
    onError: (e) => toast.error(e?.response?.data?.error || e.message),
  })

  function handleSave() {
    // Sanitize: strip _key, ensure orderNo sequential
    const sanitized = questions.map((q, i) => {
      const { _key, id, surveyTemplateId, createdAt, updatedAt, ...rest } = q
      return {
        ...rest,
        orderNo: i + 1,
        minValue: rest.minValue !== '' && rest.minValue != null ? Number(rest.minValue) : null,
        maxValue: rest.maxValue !== '' && rest.maxValue != null ? Number(rest.maxValue) : null,
        stepValue: rest.stepValue !== '' && rest.stepValue != null ? Number(rest.stepValue) : null,
        options: (rest.options || []).map((o, j) => {
          const { _key, id, questionId, createdAt, updatedAt, ...orest } = o
          return {
            ...orest,
            orderNo: j + 1,
            scoreValue: Number(orest.scoreValue) || 0,
          }
        }),
      }
    })
    const rangesSan = ranges.map((r) => {
      const { _key, id, surveyTemplateId, createdAt, ...rest } = r
      return {
        ...rest,
        minScore: Number(rest.minScore),
        maxScore: Number(rest.maxScore),
      }
    })
    saveMutation.mutate({ questions: sanitized, scoreRanges: rangesSan })
  }

  function moveItem(arr, idx, dir) {
    const j = idx + dir
    if (j < 0 || j >= arr.length) return arr
    const copy = [...arr]
    ;[copy[idx], copy[j]] = [copy[j], copy[idx]]
    return copy
  }

  if (isLoading || !tpl) {
    return <div className="text-sm text-muted-foreground">Đang tải template...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Template: {tpl.name}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              <code>{tpl.code}</code> · <Badge variant="outline">{tpl.surveyType}</Badge>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
          </Button>
        </CardHeader>
        <CardContent className="text-xs text-amber-700 bg-amber-50 rounded p-3">
          ⚠️ Lưu sẽ <strong>xoá-tạo lại</strong> toàn bộ câu hỏi + options + ranges của template.
          Chỉ nên dùng khi template đang ở trạng thái DRAFT, vì user answers sẽ bị xoá cascade.
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Câu hỏi ({questions.length})</CardTitle>
          <Button
            size="sm"
            onClick={() => setQuestions([...questions, newQuestion(questions.length)])}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Chưa có câu hỏi. Bấm "Thêm câu hỏi" ở trên.
            </div>
          )}
          {questions.map((q, idx) => (
            <QuestionCard
              key={q._key}
              question={q}
              idx={idx}
              total={questions.length}
              onChange={(updated) => {
                const copy = [...questions]
                copy[idx] = updated
                setQuestions(copy)
              }}
              onDelete={() => setQuestions(questions.filter((_, i) => i !== idx))}
              onMoveUp={() => setQuestions(moveItem(questions, idx, -1))}
              onMoveDown={() => setQuestions(moveItem(questions, idx, 1))}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dải điểm → Mode</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng điểm rơi vào dải nào → finalMode đó. App dùng để route healing recommendations.
            </p>
          </div>
          <Button size="sm" onClick={() => setRanges([...ranges, newRange()])}>
            <Plus className="mr-2 h-4 w-4" /> Thêm dải
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {ranges.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Chưa có dải điểm.
            </div>
          )}
          {ranges.map((r, idx) => (
            <div key={r._key} className="grid gap-2 md:grid-cols-6 items-end p-3 border rounded">
              <div>
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={r.minScore}
                  onChange={(e) => {
                    const copy = [...ranges]; copy[idx] = { ...r, minScore: e.target.value }
                    setRanges(copy)
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={r.maxScore}
                  onChange={(e) => {
                    const copy = [...ranges]; copy[idx] = { ...r, maxScore: e.target.value }
                    setRanges(copy)
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Mode code</Label>
                <Input
                  value={r.modeCode}
                  placeholder="STABLE"
                  onChange={(e) => {
                    const copy = [...ranges]; copy[idx] = { ...r, modeCode: e.target.value }
                    setRanges(copy)
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Mode label</Label>
                <Input
                  value={r.modeLabel}
                  placeholder="Ổn định"
                  onChange={(e) => {
                    const copy = [...ranges]; copy[idx] = { ...r, modeLabel: e.target.value }
                    setRanges(copy)
                  }}
                />
              </div>
              <div className="md:col-span-1">
                <Label className="text-xs">Mô tả</Label>
                <Input
                  value={r.description || ''}
                  onChange={(e) => {
                    const copy = [...ranges]; copy[idx] = { ...r, description: e.target.value }
                    setRanges(copy)
                  }}
                />
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRanges(ranges.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function QuestionCard({ question, idx, total, onChange, onDelete, onMoveUp, onMoveDown }) {
  const q = question
  const hasOptions = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'YES_NO'].includes(q.questionType)
  const isSlider = q.questionType === 'SLIDER'

  function update(patch) {
    onChange({ ...q, ...patch })
  }
  function updateOpt(i, patch) {
    const opts = [...(q.options || [])]
    opts[i] = { ...opts[i], ...patch }
    update({ options: opts })
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="muted">#{idx + 1}</Badge>
          <Input
            className="w-40 h-8 text-xs font-mono"
            value={q.code}
            onChange={(e) => update({ code: e.target.value })}
            placeholder="code"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={idx === 0} onClick={onMoveUp}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={idx === total - 1} onClick={onMoveDown}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <div className="md:col-span-3">
          <Label className="text-xs">Câu hỏi</Label>
          <Textarea
            rows={2}
            value={q.questionText}
            onChange={(e) => update({ questionText: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Loại</Label>
          <Select value={q.questionType} onValueChange={(v) => update({ questionType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={q.isRequired}
            onChange={(e) => update({ isRequired: e.target.checked })}
          />
          Bắt buộc
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={q.isScored}
            onChange={(e) => update({ isScored: e.target.checked })}
          />
          Tính điểm
        </label>
        <Input
          className="h-8"
          placeholder="Placeholder"
          value={q.placeholder || ''}
          onChange={(e) => update({ placeholder: e.target.value })}
        />
        <Input
          className="h-8"
          placeholder="Help text"
          value={q.helpText || ''}
          onChange={(e) => update({ helpText: e.target.value })}
        />
      </div>

      {isSlider && (
        <div className="grid gap-2 md:grid-cols-3 text-xs">
          <div>
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              value={q.minValue ?? ''}
              onChange={(e) => update({ minValue: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Max</Label>
            <Input
              type="number"
              value={q.maxValue ?? ''}
              onChange={(e) => update({ maxValue: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Step</Label>
            <Input
              type="number"
              value={q.stepValue ?? ''}
              onChange={(e) => update({ stepValue: e.target.value })}
            />
          </div>
        </div>
      )}

      {hasOptions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Tuỳ chọn</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                update({ options: [...(q.options || []), newOption((q.options || []).length)] })
              }
            >
              <Plus className="mr-1 h-3 w-3" /> Thêm
            </Button>
          </div>
          {(q.options || []).map((opt, i) => (
            <div key={opt._key || opt.id || i} className="grid gap-1 md:grid-cols-12 items-end p-2 bg-background border rounded text-xs">
              <Input
                className="md:col-span-2 h-8 font-mono"
                placeholder="code"
                value={opt.optionCode}
                onChange={(e) => updateOpt(i, { optionCode: e.target.value })}
              />
              <Input
                className="md:col-span-4 h-8"
                placeholder="Label"
                value={opt.optionLabel}
                onChange={(e) => updateOpt(i, { optionLabel: e.target.value })}
              />
              <Input
                className="md:col-span-2 h-8"
                placeholder="Value"
                value={opt.optionValue}
                onChange={(e) => updateOpt(i, { optionValue: e.target.value })}
              />
              <Input
                className="md:col-span-2 h-8"
                type="number"
                placeholder="Score"
                value={opt.scoreValue}
                onChange={(e) => updateOpt(i, { scoreValue: e.target.value })}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => update({ options: q.options.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
