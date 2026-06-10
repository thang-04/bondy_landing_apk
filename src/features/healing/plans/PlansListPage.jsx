import { ContentListPage } from '../ContentListPage'
import { coursesApi } from './api'

export function PlansListPage() {
  return (
    <ContentListPage
      title="Lộ trình chữa lành"
      description="Course / Plan nhiều ngày với các bài tập, audio, bài đọc"
      basePath="/healing/plans"
      api={coursesApi}
      queryKey={['admin', 'healing', 'courses']}
      extraColumns={[
        {
          header: 'Số ngày',
          className: 'text-center',
          render: (row) => row.course?.durationDays || '—',
        },
        {
          header: 'Lessons',
          className: 'text-center',
          render: (row) => row.course?._count?.lessons ?? 0,
        },
      ]}
    />
  )
}
