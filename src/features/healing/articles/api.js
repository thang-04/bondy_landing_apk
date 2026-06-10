import { api, unwrap } from '@/lib/api'

export const articlesApi = {
  list(params) { return unwrap(api.get('/admin/healing/articles', { params })) },
  get(id) { return unwrap(api.get(`/admin/healing/articles/${id}`)) },
  create(payload) { return unwrap(api.post('/admin/healing/articles', payload)) },
  update(id, payload) { return unwrap(api.patch(`/admin/healing/articles/${id}`, payload)) },
  remove(id) { return unwrap(api.delete(`/admin/healing/articles/${id}`)) },
}
