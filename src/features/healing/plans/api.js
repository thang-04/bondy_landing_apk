import { api, unwrap } from '@/lib/api'

export const coursesApi = {
  list(params) { return unwrap(api.get('/admin/healing/courses', { params })) },
  get(id) { return unwrap(api.get(`/admin/healing/courses/${id}`)) },
  create(payload) { return unwrap(api.post('/admin/healing/courses', payload)) },
  update(id, payload) { return unwrap(api.patch(`/admin/healing/courses/${id}`, payload)) },
  remove(id) { return unwrap(api.delete(`/admin/healing/courses/${id}`)) },
}
