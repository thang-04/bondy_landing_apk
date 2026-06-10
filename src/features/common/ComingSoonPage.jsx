import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ComingSoonPage({ title, sprint }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Construction className="h-10 w-10 text-muted-foreground" />
          <div className="text-lg font-medium">Đang phát triển</div>
          <p className="text-sm text-muted-foreground max-w-md">
            Module này sẽ được hoàn thiện ở {sprint}. Hiện tại đang dừng ở checkpoint sau S2 để bạn review.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
