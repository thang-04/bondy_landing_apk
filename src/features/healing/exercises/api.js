import { api, unwrap } from '@/lib/api'

export const exercisesApi = {
  list(params) { return unwrap(api.get('/admin/healing/exercises', { params })) },
  get(id) { return unwrap(api.get(`/admin/healing/exercises/${id}`)) },
  create(payload) { return unwrap(api.post('/admin/healing/exercises', payload)) },
  update(id, payload) { return unwrap(api.patch(`/admin/healing/exercises/${id}`, payload)) },
  remove(id) { return unwrap(api.delete(`/admin/healing/exercises/${id}`)) },
}
