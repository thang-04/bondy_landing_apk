import { ContentListPage } from '../ContentListPage'
import { audiosApi } from './api'

function fmtDuration(sec) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AudiosListPage() {
  return (
    <ContentListPage
      title="Audio chữa lành"
      description="Quản lý các bản audio thiền / breathing / chữa lành"
      basePath="/healing/audios"
      api={audiosApi}
      queryKey={['admin', 'healing', 'audios']}
      extraColumns={[
        {
          header: 'Narrator',
          render: (row) => row.audioDetail?.narratorName || '—',
        },
        {
          header: 'Duration',
          className: 'text-center',
          render: (row) => fmtDuration(row.audioDetail?.durationSeconds),
        },
      ]}
    />
  )
}
