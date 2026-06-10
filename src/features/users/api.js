import { api, unwrap } from '@/lib/api'

export const usersApi = {
  list(params = {}) {
    return unwrap(api.get('/admin/users', { params }))
  },
  get(id) {
    return unwrap(api.get(`/admin/users/${id}`))
  },
  update(id, payload) {
    return unwrap(api.patch(`/admin/users/${id}`, payload))
  },
}
