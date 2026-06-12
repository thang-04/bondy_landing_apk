import { api, unwrap } from '@/lib/api'

export const reviewsApi = {
  list() {
    return unwrap(api.get('/admin/reviews'))
  },
  delete(id) {
    return unwrap(api.delete(`/admin/reviews/${id}`))
  }
}
