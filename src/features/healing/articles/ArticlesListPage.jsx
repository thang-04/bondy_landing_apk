import { ContentListPage } from '../ContentListPage'
import { articlesApi } from './api'

export function ArticlesListPage() {
  return (
    <ContentListPage
      title="Bài đọc Healing"
      description="Quản lý bài viết chữa lành"
      basePath="/healing/articles"
      api={articlesApi}
      queryKey={['admin', 'healing', 'articles']}
      extraColumns={[
        {
          header: 'Tác giả',
          render: (row) => row.articleDetail?.authorName || '—',
        },
        {
          header: 'Thời lượng đọc',
          className: 'text-center',
          render: (row) =>
            row.articleDetail?.estimatedReadMinutes
              ? `${row.articleDetail.estimatedReadMinutes} phút`
              : '—',
        },
      ]}
    />
  )
}
