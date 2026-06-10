import { ContentListPage } from '../ContentListPage'
import { exercisesApi } from './api'
import { Badge } from '@/components/ui/badge'

export function ExercisesListPage() {
  return (
    <ContentListPage
      title="Bài tập Healing"
      description="Các bài tập breathing / grounding / journaling"
      basePath="/healing/exercises"
      api={exercisesApi}
      queryKey={['admin', 'healing', 'exercises']}
      extraColumns={[
        {
          header: 'Loại',
          render: (row) => <Badge variant="outline">{row.exerciseDetail?.exerciseType || '—'}</Badge>,
        },
        {
          header: 'Thời lượng',
          className: 'text-center',
          render: (row) =>
            row.exerciseDetail?.durationMinutes
              ? `${row.exerciseDetail.durationMinutes} phút`
              : '—',
        },
      ]}
    />
  )
}
